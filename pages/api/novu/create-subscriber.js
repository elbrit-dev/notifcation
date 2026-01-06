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
    console.log('🔍 Fetching OneSignal ID from OneSignal API for deviceToken:', deviceToken);

    // Try multiple approaches to get user data
    let userResponse = null;

    // Approach 1: Try by player_id (subscription ID)
    const playerUrl = `https://api.onesignal.com/apps/${oneSignalAppId}/users/by/player_id/${deviceToken}`;
    userResponse = await fetch(playerUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${oneSignalApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Approach 2: If player_id fails, try by onesignal_id (in case deviceToken is already a OneSignal ID)
    if (!userResponse.ok || userResponse.status === 404) {
      console.log('ℹ️ Player ID not found, trying as OneSignal ID...');
      const onesignalIdUrl = `https://api.onesignal.com/apps/${oneSignalAppId}/users/by/onesignal_id/${deviceToken}`;
      userResponse = await fetch(onesignalIdUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${oneSignalApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // If this succeeds, the deviceToken itself is the OneSignal ID
      if (userResponse.ok) {
        console.log('✅ DeviceToken is already a OneSignal ID:', deviceToken);
        return deviceToken;
      }
    }

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.warn('⚠️ OneSignal user fetch failed:', userResponse.status, errorText);
      return null;
    }

    const userData = await userResponse.json();
    console.log('📊 OneSignal user data retrieved');

    // Extract OneSignal ID from the response
    if (userData.identity?.onesignal_id) {
      const onesignalId = userData.identity.onesignal_id;
      console.log('✅ OneSignal ID extracted:', onesignalId);
      return onesignalId;
    } else {
      console.warn('⚠️ OneSignal ID not found in response');
      return null;
    }

  } catch (error) {
    console.error('❌ Error fetching OneSignal ID from OneSignal:', error);
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

    // Step 1: Create/Update subscriber profile
    console.log('📝 Creating/updating Novu subscriber:', {
      subscriberId,
      email,
      firstName,
      lastName,
      externalId
    });

    // Use REST API directly (same approach as auth.js)
    const headers = {
      Authorization: `ApiKey ${novuSecretKey}`,
      'Content-Type': 'application/json',
      'idempotency-key': subscriberId
    };

    const subscriberPayload = {
      subscriberId: String(subscriberId),
      email: email || null,
      firstName: firstName || null,
      lastName: lastName || null,
    };

    // Add data field if externalId is provided
    if (externalId) {
      subscriberPayload.data = {
        externalId: externalId
      };
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

      // Update to ensure latest profile data
      const updateRes = await fetch(`https://api.novu.co/v2/subscribers/${encodeURIComponent(subscriberId)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(subscriberPayload)
      });

      if (updateRes.ok) {
        console.log('✅ Novu subscriber updated successfully:', subscriberId);
      } else {
        const errText = await updateRes.text();
        console.warn('⚠️ Novu subscriber update failed:', updateRes.status, errText);
        // Don't fail if update fails - subscriber might have been created
      }
    } catch (subError) {
      console.error('❌ Error creating subscriber profile:', subError);
      return res.status(500).json({
        error: 'Failed to create subscriber profile',
        details: subError.message
      });
    }

    // Step 2: Update OneSignal credentials with OneSignal ID ONLY (no fallback to subscription ID)
    // Get deviceToken to use for fetching OneSignal ID
    const deviceTokenToFetch = oneSignalSubscriptionId || oneSignalId;
    
    // Fetch OneSignal ID from OneSignal API
    let onesignalIdForDeviceToken = null;
    if (deviceTokenToFetch) {
      console.log('📱 Fetching OneSignal ID from OneSignal API...');
      onesignalIdForDeviceToken = await fetchOneSignalIdFromOneSignal(deviceTokenToFetch);
      
      if (onesignalIdForDeviceToken) {
        console.log('✅ OneSignal ID retrieved from OneSignal API:', onesignalIdForDeviceToken);
      } else {
        console.error('❌ OneSignal ID not available from OneSignal API:', {
          subscriberId,
          deviceTokenUsed: deviceTokenToFetch,
          oneSignalSubscriptionId: oneSignalSubscriptionId || 'NULL',
          oneSignalId: oneSignalId || 'NULL',
          error: 'Could not fetch OneSignal ID from OneSignal API',
          action: 'Skipping device token update - push notifications will not work (no fallback to subscription ID)'
        });
      }
    } else {
      console.error('❌ No device token provided to fetch OneSignal ID:', {
        subscriberId,
        oneSignalSubscriptionId: oneSignalSubscriptionId || 'NULL',
        oneSignalId: oneSignalId || 'NULL',
        error: 'No device token available to fetch OneSignal ID',
        action: 'Skipping device token update - push notifications will not work'
      });
    }
    
    // Use ONLY OneSignal ID as deviceToken (no fallback)
    if (onesignalIdForDeviceToken) {
      console.log('📱 Updating OneSignal credentials with OneSignal ID:', {
        subscriberId,
        onesignalId: onesignalIdForDeviceToken
      });

      const integrationIdentifier = process.env.NOVU_INTEGRATION_IDENTIFIER || 
                                    process.env.NEXT_PUBLIC_NOVU_INTEGRATION_IDENTIFIER || 
                                    null;

      const updateParams = {
        providerId: ChatOrPushProviderEnum.OneSignal,
        credentials: {
          deviceTokens: [onesignalIdForDeviceToken], // Use ONLY OneSignal ID (onesignal_id) as device token
        },
      };

      if (integrationIdentifier) {
        updateParams.integrationIdentifier = integrationIdentifier;
      }

      try {
        await novu.subscribers.credentials.update(updateParams, subscriberId);
        console.log('✅ OneSignal credentials updated successfully with OneSignal ID:', onesignalIdForDeviceToken);
      } catch (credError) {
        console.error('❌ Error updating OneSignal credentials:', {
          subscriberId,
          onesignalId: onesignalIdForDeviceToken,
          error: credError.message || credError,
          action: 'No fallback - OneSignal ID is required'
        });
        return res.status(500).json({
          error: 'Failed to update OneSignal credentials',
          details: credError.message,
          note: 'OneSignal ID is required - no fallback to subscription ID'
        });
      }
    } else {
      console.error('❌ OneSignal ID not available - skipping credentials update:', {
        subscriberId,
        oneSignalSubscriptionId: oneSignalSubscriptionId || 'NULL',
        oneSignalId: oneSignalId || 'NULL',
        issue: 'OneSignal ID not fetched from OneSignal API',
        action: 'Push notifications will not work - OneSignal ID is required (no fallback)'
      });
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

