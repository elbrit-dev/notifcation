import { Novu } from '@novu/api';
import { ChatOrPushProviderEnum } from "@novu/api/models/components";

/**
 * Fetch user data from OneSignal API using player ID or subscription ID
 * @param {string} deviceToken - OneSignal Player ID or Subscription ID
 * @returns {Promise<{subscriberId: string, firstName: string, lastName: string, email: string, phone: string} | null>}
 */
async function fetchUserDataFromOneSignal(deviceToken) {
  if (!deviceToken) {
    return null;
  }

  const oneSignalAppId = process.env.ONESIGNAL_APP_ID || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'ae84e191-00f5-445c-8e43-173709b8a553';
  const oneSignalApiKey = process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY;

  if (!oneSignalApiKey) {
    console.warn('⚠️ OneSignal REST API key not configured. Skipping OneSignal data fetch.');
    return null;
  }

  try {
    console.log('🔍 Fetching user data from OneSignal for deviceToken:', deviceToken);

    // Try to get user data directly by player_id (deviceToken)
    // OneSignal API: GET /apps/{app_id}/users/by/player_id/{player_id}
    const userUrl = `https://api.onesignal.com/apps/${oneSignalAppId}/users/by/player_id/${deviceToken}`;
    
    let userResponse = await fetch(userUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${oneSignalApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // If player_id lookup fails, try using deviceToken as onesignal_id
    if (!userResponse.ok && userResponse.status === 404) {
      console.log('ℹ️ Player ID not found, trying deviceToken as onesignal_id');
      const userUrlById = `https://api.onesignal.com/apps/${oneSignalAppId}/users/by/onesignal_id/${deviceToken}`;
      userResponse = await fetch(userUrlById, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${oneSignalApiKey}`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.warn('⚠️ OneSignal user fetch failed:', userResponse.status, errorText);
      return null;
    }

    const userData = await userResponse.json();
    console.log('📊 OneSignal user data:', userData);

    // Extract user information
    const tags = userData.properties?.tags || {};
    const identity = userData.identity || {};
    const subscriptions = userData.subscriptions || [];

    // Get email from subscriptions (Email type) or tags
    let email = null;
    const emailSubscription = subscriptions.find(sub => sub.type === 'Email' && sub.token);
    if (emailSubscription) {
      email = emailSubscription.token;
    } else if (tags.email) {
      email = tags.email;
    }

    // Get phone from subscriptions (SMS type) or tags
    let phone = null;
    const smsSubscription = subscriptions.find(sub => sub.type === 'SMS' && sub.token);
    if (smsSubscription) {
      phone = smsSubscription.token;
    } else if (tags.phone || tags.phoneNumber) {
      phone = tags.phone || tags.phoneNumber;
    }

    // Get name from tags
    const firstName = tags.first_name || tags.firstName || tags.FirstName || null;
    const lastName = tags.last_name || tags.lastName || tags.LastName || null;

    // Get subscriberId from external_id or tags
    const subscriberId = identity.external_id || tags.EmployeeID || tags.employeeId || tags.subscriberId || null;

    const result = {
      subscriberId,
      firstName,
      lastName,
      email,
      phone
    };

    console.log('✅ OneSignal user data extracted:', result);
    return result;

  } catch (error) {
    console.error('❌ Error fetching user data from OneSignal:', error);
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
    let firstName = null;
    let lastName = null;
    if (displayName) {
      const nameParts = (displayName || '').trim().split(' ');
      firstName = nameParts[0] || null;
      lastName = nameParts.slice(1).join(' ') || null;
    }

    // Fetch user data from OneSignal if deviceToken is available
    const deviceToken = oneSignalSubscriptionId || oneSignalId;
    let onesignalData = null;
    if (deviceToken) {
      console.log('📱 DeviceToken provided, fetching user data from OneSignal...');
      onesignalData = await fetchUserDataFromOneSignal(deviceToken);
      
      if (onesignalData) {
        console.log('✅ OneSignal data retrieved, using it to enrich subscriber data');
        // Use OneSignal data to override or fill missing fields
        subscriberId = onesignalData.subscriberId || subscriberId;
        firstName = onesignalData.firstName || firstName;
        lastName = onesignalData.lastName || lastName;
        email = onesignalData.email || email;
      } else {
        console.log('ℹ️ OneSignal data not available, using provided data');
      }
    }

    // Step 1: Create/Update subscriber profile
    console.log('📝 Creating/updating Novu subscriber:', {
      subscriberId,
      email,
      firstName,
      lastName,
      externalId,
      fromOneSignal: !!onesignalData
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

    // Step 2: Update OneSignal credentials with subscription ID
    if (oneSignalSubscriptionId) {
      console.log('📱 Updating OneSignal credentials:', {
        subscriberId,
        subscriptionId: oneSignalSubscriptionId
      });

      const integrationIdentifier = process.env.NOVU_INTEGRATION_IDENTIFIER || 
                                    process.env.NEXT_PUBLIC_NOVU_INTEGRATION_IDENTIFIER || 
                                    null;

      const updateParams = {
        providerId: ChatOrPushProviderEnum.OneSignal,
        credentials: {
          deviceTokens: [oneSignalSubscriptionId], // Use subscription ID as device token
        },
      };

      if (integrationIdentifier) {
        updateParams.integrationIdentifier = integrationIdentifier;
      }

      try {
        await novu.subscribers.credentials.update(updateParams, subscriberId);
        console.log('✅ OneSignal credentials updated successfully');
      } catch (credError) {
        console.error('❌ Error updating OneSignal credentials:', credError);
        
        // Try fallback with OneSignal ID if provided
        if (oneSignalId && oneSignalId !== oneSignalSubscriptionId) {
          console.log('🔄 Attempting fallback with OneSignal ID...');
          try {
            const fallbackParams = {
              ...updateParams,
              credentials: {
                deviceTokens: [oneSignalId],
              },
            };
            await novu.subscribers.credentials.update(fallbackParams, subscriberId);
            console.log('✅ OneSignal credentials updated with OneSignal ID fallback');
          } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
            return res.status(500).json({
              error: 'Failed to update OneSignal credentials',
              details: fallbackError.message,
              attempted: {
                subscriptionId: oneSignalSubscriptionId,
                oneSignalId: oneSignalId
              }
            });
          }
        } else {
          return res.status(500).json({
            error: 'Failed to update OneSignal credentials',
            details: credError.message
          });
        }
      }
    } else {
      console.warn('⚠️ No OneSignal subscription ID provided, skipping credentials update');
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

