import { Novu } from '@novu/api';
import { ChatOrPushProviderEnum } from "@novu/api/models/components";

/**
 * Fetch OneSignal ID (onesignal_id) from OneSignal API using Player ID or Subscription ID
 * @param {string} deviceToken - OneSignal Player ID or Subscription ID
 * @returns {Promise<string | null>} - Returns OneSignal ID (onesignal_id) or null
 */
async function fetchOneSignalIdFromOneSignal(deviceToken) {
  if (!deviceToken) {
    return null;
  }

  const oneSignalAppId = process.env.ONESIGNAL_APP_ID || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'ae84e191-00f5-445c-8e43-173709b8a553';
  const oneSignalApiKey = process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY;

  if (!oneSignalApiKey) {
    console.warn('⚠️ OneSignal REST API key not configured. Cannot fetch OneSignal ID.');
    return null;
  }

  try {
    let userResponse = await fetch(`https://api.onesignal.com/apps/${oneSignalAppId}/users/by/player_id?player_id=${deviceToken}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${oneSignalApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok || userResponse.status === 404) {
      userResponse = await fetch(`https://api.onesignal.com/apps/${oneSignalAppId}/users/by/onesignal_id/${deviceToken}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${oneSignalApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (userResponse.ok) return deviceToken;
    }

    if (!userResponse.ok) return null;

    const userData = await userResponse.json();
    return userData.identity?.onesignal_id || null;
  } catch (error) {
    console.error('❌ Error fetching OneSignal ID:', error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      subscriberId,        // Employee ID (e.g., 'IN003')
      email,              // Email (e.g., 'mounika@elbrit.org')
      displayName,         // Display name (e.g., 'mounika M')
      phone,              // Phone number (e.g., '+919345405242')
      oneSignalSubscriptionId, // Subscription ID (e.g., '85eacb69-525c-41c5-8c24-1d59a64e7b90')
      externalId,         // External ID (e.g., 'mounika@elbrit.org')
      oneSignalId        // OneSignal ID (e.g., 'mounika@elbrit.org')
    } = req.body;

    // Validate required fields
    if (!subscriberId) {
      return res.status(400).json({
        error: 'Missing required field: subscriberId (employeeId)'
      });
    }

    const novuSecretKey = process.env.NOVU_SECRET_KEY || process.env.NEXT_PUBLIC_NOVU_SECRET_KEY;
    if (!novuSecretKey) {
      return res.status(500).json({
        error: 'Novu secret key not configured'
      });
    }

    const novu = new Novu({
      secretKey: novuSecretKey,
    });

    // Parse display name into first and last name
    const nameParts = (displayName || '').trim().split(' ');
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(' ') || null;

    // Create/Update subscriber profile

    const headers = {
      Authorization: `ApiKey ${novuSecretKey}`,
      'Content-Type': 'application/json',
      'idempotency-key': subscriberId
    };

    const subscriberPayload = {
      subscriberId: String(subscriberId),
      email: email || "mounika@elbrit.org",
      firstName: firstName || "Mounika",
      lastName: lastName || "M",
      phone: phone || "+919345405242"
    };

    if (externalId || oneSignalId) {
      subscriberPayload.data = {};
      if (externalId) subscriberPayload.data.externalId = externalId;
      if (oneSignalId) subscriberPayload.data.oneSignalId = oneSignalId;
    }

    try {
      // Create subscriber (ignore if already exists)
      const createRes = await fetch(`https://api.novu.co/v2/subscribers?failIfExists=true`, {
        method: 'POST',
        headers,
        body: JSON.stringify(subscriberPayload)
      });

      if (createRes.ok) {
        console.log('✅ Novu subscriber created successfully:', subscriberId);
      } else if (createRes.status === 409) {
        console.log('ℹ️ Novu subscriber already exists, will update:', subscriberId);
      } else {
        const errText = await createRes.text();
        console.warn('⚠️ Novu subscriber create failed:', createRes.status, errText);
      }

      // Wait a bit to ensure subscriber is fully created before updating
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update to ensure latest profile data
      console.log('📤 Updating Novu subscriber with payload:', JSON.stringify(subscriberPayload, null, 2));
      
      const updateRes = await fetch(`https://api.novu.co/v2/subscribers/${encodeURIComponent(subscriberId)}`, {
        method: 'PUT',
        headers: {
          Authorization: `ApiKey ${novuSecretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriberPayload)
      });

      const responseText = await updateRes.text();
      let updateData = null;
      try {
        updateData = JSON.parse(responseText);
      } catch (e) {
        // Response might not be JSON
      }

      if (updateRes.ok) {
        console.log('✅ Novu subscriber updated successfully:', {
          subscriberId,
          firstName: subscriberPayload.firstName || 'NOT SET',
          lastName: subscriberPayload.lastName || 'NOT SET',
          email: subscriberPayload.email || 'NOT SET',
          phone: subscriberPayload.phone || 'NOT SET',
          response: updateData || responseText
        });
      } else {
        console.error('❌ Novu subscriber update FAILED:', {
          status: updateRes.status,
          statusText: updateRes.statusText,
          error: responseText,
          payload: JSON.stringify(subscriberPayload, null, 2)
        });
      }
    } catch (subError) {
      console.error('❌ Error creating subscriber profile:', subError);
      return res.status(500).json({
        error: 'Failed to create subscriber profile',
        details: subError.message
      });
    }

    const deviceTokenToFetch = oneSignalSubscriptionId || oneSignalId;
    const onesignalIdForDeviceToken = deviceTokenToFetch ? await fetchOneSignalIdFromOneSignal(deviceTokenToFetch) : null;
    
    if (onesignalIdForDeviceToken) {
      const updateParams = {
        providerId: ChatOrPushProviderEnum.OneSignal,
        credentials: { deviceTokens: [onesignalIdForDeviceToken] }
      };

      const integrationIdentifier = process.env.NOVU_INTEGRATION_IDENTIFIER || process.env.NEXT_PUBLIC_NOVU_INTEGRATION_IDENTIFIER;
      if (integrationIdentifier) {
        updateParams.integrationIdentifier = integrationIdentifier;
      }

      try {
        await novu.subscribers.credentials.update(updateParams, subscriberId);
        console.log('✅ OneSignal credentials updated:', subscriberId);
      } catch (credError) {
        console.error('❌ OneSignal credentials update failed:', credError.message);
        return res.status(500).json({
          error: 'Failed to update OneSignal credentials',
          details: credError.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Subscriber created/updated successfully',
      subscriber: {
        subscriberId,
        email,
        firstName,
        lastName,
        externalId,
        oneSignalSubscriptionId,
        oneSignalId
      }
    });

  } catch (error) {
    console.error('❌ Error creating Novu subscriber:', error);
    return res.status(500).json({
      error: 'Failed to create subscriber',
      details: error.message
    });
  }
}

