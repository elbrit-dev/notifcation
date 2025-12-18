import { Novu } from '@novu/api';
import { ChatOrPushProviderEnum } from "@novu/api/models/components";

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

    const subscriberPayload = {
      subscriberId: String(subscriberId),
      email: email || null,
      firstName: firstName || null,
      lastName: lastName || null,
    };

    // Add external ID if provided
    if (externalId) {
      subscriberPayload.data = {
        externalId: externalId
      };
    }

    try {
      // Create subscriber (will update if exists)
      await novu.subscribers.identify(subscriberId, {
        email: email || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        data: externalId ? { externalId } : undefined
      });
      console.log('✅ Novu subscriber profile created/updated:', subscriberId);
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

