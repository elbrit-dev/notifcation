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
    // Try fetching by player_id first
    let userResponse = await fetch(`https://api.onesignal.com/apps/${oneSignalAppId}/users/by/player_id?player_id=${deviceToken}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${oneSignalApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // If not found by player_id, try by onesignal_id
    if (!userResponse.ok || userResponse.status === 404) {
      userResponse = await fetch(`https://api.onesignal.com/apps/${oneSignalAppId}/users/by/onesignal_id/${deviceToken}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${oneSignalApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        return userData.identity?.onesignal_id || deviceToken;
      }
    }

    if (!userResponse.ok) return null;

    const userData = await userResponse.json();
    return userData.identity?.onesignal_id || null;
  } catch (error) {
    console.error('❌ Error fetching OneSignal ID:', error);
    return null;
  }
}

async function createOrUpdateNovuSubscriber({ subscriberId, firstName, lastName, email, phone, novuSecretKey, customData }) {
  if (!subscriberId || !novuSecretKey) {
    console.warn('⚠️ Missing subscriberId or novuSecretKey for Novu subscriber creation');
    return { success: false, error: 'Missing required parameters' };
  }

  const headers = {
    Authorization: `ApiKey ${novuSecretKey}`,
    'Content-Type': 'application/json',
    'idempotency-key': subscriberId
  };

  // Build payload - include all fields (caller always provides fallbacks, so these should always have values)
  const payload = {
    subscriberId: String(subscriberId),
    firstName: firstName || null,
    lastName: lastName || null,
    email: email || null,
    phone: phone || null
  };

  // Add custom data fields (chatId, externalId, oneSignalId, etc.) if provided
  if (customData && typeof customData === 'object' && Object.keys(customData).length > 0) {
    payload.data = customData;
  }
  
  console.log('📋 Prepared subscriber payload:', {
    subscriberId: payload.subscriberId,
    hasFirstName: !!payload.firstName,
    hasLastName: !!payload.lastName,
    hasEmail: !!payload.email,
    email: payload.email,
    hasPhone: !!payload.phone,
    phone: payload.phone
  });

  console.log('📤 Novu subscriber payload:', JSON.stringify(payload, null, 2));

  // Create subscriber (ignore if already exists via failIfExists flag)
  let createSuccess = false;
  try {
    const createRes = await fetch(`https://api.novu.co/v2/subscribers?failIfExists=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const createResText = await createRes.text();
    let createData = null;
    try {
      createData = JSON.parse(createResText);
    } catch (e) {
      // Response might not be JSON
    }

    if (createRes.ok) {
      console.log('✅ Novu subscriber created successfully:', subscriberId);
      createSuccess = true;
    } else if (createRes.status === 409) {
      console.log('ℹ️ Novu subscriber already exists, will update:', subscriberId);
      createSuccess = true; // 409 means it exists, which is fine
    } else {
      console.warn('⚠️ Novu subscriber create failed:', {
        status: createRes.status,
        statusText: createRes.statusText,
        error: createResText,
        payload: JSON.stringify(payload, null, 2)
      });
    }
  } catch (err) {
    console.error('❌ Novu subscriber create exception:', err);
    return { success: false, error: err.message };
  }

  // Always wait a bit before update to ensure subscriber is fully created/ready
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Always update to ensure latest profile data (even if subscriber already existed)
  try {
    console.log('📤 Updating Novu subscriber with payload:', JSON.stringify(payload, null, 2));
    console.log('📤 Update URL:', `https://api.novu.co/v2/subscribers/${encodeURIComponent(subscriberId)}`);
    
    const updateRes = await fetch(`https://api.novu.co/v2/subscribers/${encodeURIComponent(subscriberId)}`, {
      method: 'PUT',
      headers: {
        Authorization: `ApiKey ${novuSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const updateResText = await updateRes.text();
    let updateData = null;
    try {
      updateData = JSON.parse(updateResText);
    } catch (e) {
      // Response might not be JSON
    }

    if (updateRes.ok) {
      console.log('✅ Novu subscriber updated successfully:', {
        subscriberId,
        firstName: payload.firstName || 'N/A',
        lastName: payload.lastName || 'N/A',
        email: payload.email || 'N/A',
        phone: payload.phone || 'N/A',
        response: updateData || updateResText
      });
      return { success: true, data: updateData };
    } else {
      console.error('❌ Novu subscriber update FAILED:', {
        status: updateRes.status,
        statusText: updateRes.statusText,
        error: updateResText,
        payload: JSON.stringify(payload, null, 2)
      });
      return { success: false, error: updateResText, status: updateRes.status };
    }
  } catch (err) {
    console.error('❌ Novu subscriber update exception:', err);
    return { success: false, error: err.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, phoneNumber, authProvider, oneSignalPlayerId, oneSignalSubscriptionId } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phone number is required' });
  }

  try {
    // ERPNext API configuration
    const erpnextUrl = process.env.ERPNEXT_URL;
    const erpnextApiKey = process.env.ERPNEXT_API_KEY;
    const erpnextApiSecret = process.env.ERPNEXT_API_SECRET;

    if (!erpnextUrl || !erpnextApiKey || !erpnextApiSecret) {
      console.error('❌ ERPNext environment variables not configured');
      return res.status(500).json({ error: 'ERPNext configuration missing' });
    }

    console.log('🔐 ERPNext Auth Request:', { email, phoneNumber, authProvider });
    console.log('🔧 ERPNext Config:', { 
      url: erpnextUrl, 
      hasApiKey: !!erpnextApiKey, 
      hasApiSecret: !!erpnextApiSecret 
    });

    // Always search by company_email for role-based access
    // For Microsoft SSO: use email directly as company_email
    // For Phone Auth: get company_email from Employee data first, then search
    let companyEmail = email; // Default for Microsoft SSO
    let searchValue = email;

    // If phone authentication, we need to get the employee data by phone number first
    let employeeIdFromPhone = null;
    if (phoneNumber && !email) {
      console.log('📱 Phone authentication - searching for employee by phone number');
      
      // Clean phone number (remove +91 country code)
      const cleanedPhoneNumber = phoneNumber.replace(/^\+91/, '').replace(/^\+/, '');
      console.log('📱 Original phone number:', phoneNumber);
      console.log('📱 Cleaned phone number:', cleanedPhoneNumber);
      
      // Search Employee table by phone number to get employee ID
      const employeeSearchUrl = `${erpnextUrl}/api/resource/Employee`;
      const employeeSearchParams = new URLSearchParams({
        filters: JSON.stringify([
          ['cell_number', '=', cleanedPhoneNumber]
        ]),
        fields: JSON.stringify(['name', 'first_name', 'cell_number', 'fsl_whatsapp_number', 'company_email', 'kly_role_id', 'status'])
      });

      console.log('🔍 Searching Employee table for phone number:', phoneNumber);
      
      const employeeResponse = await fetch(`${employeeSearchUrl}?${employeeSearchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (employeeResponse.ok) {
        const employeeResult = await employeeResponse.json();
        console.log('📊 Employee search result:', employeeResult);
        console.log('📊 Employee data count:', employeeResult.data?.length || 0);

        if (employeeResult.data && employeeResult.data.length > 0) {
          const employee = employeeResult.data[0];
          
          // Check if employee status is Active
          if (employee.status !== 'Active') {
            console.warn('⚠️ Employee account is not active:', phoneNumber, 'Status:', employee.status);
            return res.status(403).json({
              success: false,
              error: 'Access Denied',
              message: 'Your account is not active. Please contact your administrator.',
              details: {
                searchedPhone: phoneNumber,
                authProvider: authProvider,
                userSource: 'phone_inactive',
                status: employee.status
              }
            });
          }
          
          // Store employee ID for direct fetch
          employeeIdFromPhone = employee.name;
          console.log('✅ Found employee ID for phone user:', employeeIdFromPhone);
          console.log('✅ Employee details:', employee);
          
          // If company_email exists, use it as searchValue for Microsoft SSO compatibility
          // If not, we'll fetch directly by employee ID later
          if (employee.company_email) {
            companyEmail = employee.company_email;
            searchValue = companyEmail;
            console.log('✅ Company email available:', companyEmail);
          } else {
            console.log('⚠️ No company email - will fetch by employee ID:', employeeIdFromPhone);
          }
        } else {
          console.warn('⚠️ No employee found for phone number:', phoneNumber);
          // Don't create fallback - reject access if not found
          return res.status(403).json({
            success: false,
            error: 'Access Denied',
            message: 'Phone number not found in organization. Please contact your administrator.',
            details: {
              searchedPhone: phoneNumber,
              authProvider: authProvider,
              userSource: 'phone_not_found'
            }
          });
        }
      } else {
        console.warn('⚠️ Employee search failed:', employeeResponse.status);
        // Don't create fallback - reject access if search fails
        return res.status(403).json({
          success: false,
          error: 'Access Denied',
          message: 'Unable to verify phone number. Please contact your administrator.',
          details: {
            searchedPhone: phoneNumber,
            authProvider: authProvider,
            userSource: 'phone_search_failed'
          }
        });
      }
    }

    // Now fetch user data - either by employee ID (phone auth) or by company_email (Microsoft SSO)
    let userData = null;
    let userSource = '';

    // If we have employee ID from phone auth, fetch directly by ID
    if (employeeIdFromPhone) {
      console.log('🔍 Fetching employee data by ID:', employeeIdFromPhone);
      
      const employeeUrl = `${erpnextUrl}/api/resource/Employee/${employeeIdFromPhone}`;
      
      console.log('🔍 Making ERPNext API call to:', employeeUrl);
      
      const employeeResponse = await fetch(employeeUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 ERPNext API Response Status:', employeeResponse.status);

      if (employeeResponse.ok) {
        const employeeResult = await employeeResponse.json();
        console.log('📊 ERPNext Employee fetch result:', employeeResult);

        if (employeeResult.data) {
          const employee = employeeResult.data;
          
          // Double-check employee status is Active
          if (employee.status !== 'Active') {
            console.warn('⚠️ Employee account is not active:', employeeIdFromPhone, 'Status:', employee.status);
            return res.status(403).json({
              success: false,
              error: 'Access Denied',
              message: 'Your account is not active. Please contact your administrator.',
              details: {
                employeeId: employeeIdFromPhone,
                authProvider: authProvider,
                userSource: 'employee_inactive',
                status: employee.status
              }
            });
          }
          
          userData = {
            uid: employee.name, // Use ERPNext document name as UID
            email: employee.company_email || `${employee.name}@elbrit.org`, // Fallback email if null
            phoneNumber: employee.cell_number || employee.fsl_whatsapp_number,
            displayName: employee.first_name || employee.employee_name || 'User',
            role: 'admin', // Default role for now
            roleName: 'Admin',
            kly_role_id: employee.kly_role_id || null, // Add role ID field
            authProvider: authProvider || 'phone', // Use 'phone' for phone auth
            customProperties: {
              organization: "Elbrit Life Sciences",
              accessLevel: "full",
              provider: authProvider || 'phone',
              employeeId: employee.name,
              department: employee.department,
              designation: employee.designation,
              dateOfJoining: employee.date_of_joining,
              dateOfBirth: employee.date_of_birth
            },
            employeeData: employee
          };
          userSource = 'employee_by_id';
          console.log('✅ Found user in Employee table by ID:', userData);
        }
      } else {
        const errorText = await employeeResponse.text();
        console.warn('⚠️ Employee fetch by ID failed:', employeeResponse.status);
        console.warn('⚠️ Error response:', errorText);
      }
    } 
    // Otherwise, search by company_email (for Microsoft SSO)
    else if (searchValue) {
      console.log('🔍 Searching for user by company_email:', searchValue);
      
      const employeeSearchUrl = `${erpnextUrl}/api/resource/Employee`;
      const employeeSearchParams = new URLSearchParams({
        filters: JSON.stringify([['company_email', '=', searchValue]]),
        fields: JSON.stringify(['name', 'first_name', 'employee_name', 'cell_number', 'fsl_whatsapp_number', 'company_email', 'kly_role_id', 'status', 'department', 'designation', 'date_of_joining', 'date_of_birth'])
      });

      console.log('🔍 Searching Employee table by company_email:', employeeSearchUrl);
      console.log('🔍 Search params:', employeeSearchParams.toString());
      
      const employeeResponse = await fetch(`${employeeSearchUrl}?${employeeSearchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 ERPNext API Response Status:', employeeResponse.status);

      if (employeeResponse.ok) {
        const employeeResult = await employeeResponse.json();
        console.log('📊 ERPNext Employee search result:', employeeResult);

        if (employeeResult.data && employeeResult.data.length > 0) {
          const employee = employeeResult.data[0];
          
          // Check if employee status is Active
          if (employee.status !== 'Active') {
            console.warn('⚠️ Employee account is not active:', searchValue, 'Status:', employee.status);
            return res.status(403).json({
              success: false,
              error: 'Access Denied',
              message: 'Your account is not active. Please contact your administrator.',
              details: {
                searchedEmail: searchValue,
                authProvider: authProvider,
                userSource: 'employee_inactive',
                status: employee.status
              }
            });
          }
          
          userData = {
            uid: employee.name, // Use ERPNext document name as UID
            email: employee.company_email,
            phoneNumber: employee.cell_number || employee.fsl_whatsapp_number,
            displayName: employee.first_name || employee.employee_name || employee.company_email?.split('@')[0] || 'User',
            role: 'admin', // Default role for now
            roleName: 'Admin',
            kly_role_id: employee.kly_role_id || null, // Add role ID field
            authProvider: authProvider || 'microsoft', // Use 'microsoft' for email auth
            customProperties: {
              organization: "Elbrit Life Sciences",
              accessLevel: "full",
              provider: authProvider || 'microsoft',
              employeeId: employee.name,
              department: employee.department,
              designation: employee.designation,
              dateOfJoining: employee.date_of_joining,
              dateOfBirth: employee.date_of_birth
            },
            employeeData: employee
          };
          userSource = 'employee_by_email';
          console.log('✅ Found user in Employee table by company_email:', userData);
        }
      } else {
        const errorText = await employeeResponse.text();
        console.warn('⚠️ Employee search by email failed:', employeeResponse.status);
        console.warn('⚠️ Error response:', errorText);
      }
    }

    // If user not found in ERPNext, reject access
    if (!userData) {
      console.log('❌ User not found in ERPNext by company_email:', searchValue);
      console.log('❌ Access denied - user not in organization');
      
      return res.status(403).json({
        success: false,
        error: 'Access Denied',
        message: 'User not found in organization. Please contact your administrator.',
        details: {
          searchedEmail: searchValue,
          authProvider: authProvider,
          userSource: 'not_found'
        }
      });
    }

    // Generate a simple token (you can implement JWT if needed)
    const token = Buffer.from(`${userData.uid}:${Date.now()}`).toString('base64');

    console.log('✅ ERPNext Auth successful:', {
      userSource,
      companyEmail: searchValue,
      email: userData.email,
      role: userData.role,
      authProvider: userData.authProvider
    });

    // Get employeeId from ERPNext user data for subscriber ID (fallback to test value for testing without login)
    const employeeId = userData?.customProperties?.employeeId || userData?.uid || userData?.employeeData?.name || "IN003";
    
    // Create/update Novu subscriber (will use test values if userData is not available)
    if (employeeId) {
      try {
        const novuSecretKey = process.env.NOVU_SECRET_KEY || process.env.NEXT_PUBLIC_NOVU_SECRET_KEY;
        
        if (novuSecretKey) {
          const novu = new Novu({
            secretKey: novuSecretKey,
            // Use serverURL for EU region if needed
            // serverURL: "https://eu.api.novu.co",
          });

          // Use employeeId as subscriber ID (fallback to test value if not available)
          const subscriberId = employeeId || "IN003";
          
          // Parse display name into first and last name (with fallback to test values)
          const displayName = userData?.displayName || '';
          const nameParts = displayName.trim().split(' ');
          const firstName = nameParts[0] || userData?.employeeData?.first_name || "Mounika";
          const lastName = nameParts.slice(1).join(' ') || userData?.employeeData?.employee_name?.split(' ').slice(1).join(' ') || "M";
          
          // Use actual user data from ERPNext, fallback to test values if not logged in
          const userEmail = userData?.email || "mounika@elbrit.org";
          const userPhone = userData?.phoneNumber || "+919345405242";
          
          // Extract custom data fields (chatId, externalId, etc.) from userData
          const customData = {};
          if (userData?.chatId) customData.chatId = userData.chatId;
          if (userData?.customProperties?.chatId) customData.chatId = userData.customProperties.chatId;
          if (userData?.employeeData?.chatId) customData.chatId = userData.employeeData.chatId;
          if (userData?.externalId) customData.externalId = userData.externalId;
          if (userData?.customProperties?.externalId) customData.externalId = userData.customProperties.externalId;
          if (userData?.employeeData?.externalId) customData.externalId = userData.employeeData.externalId;
          
          console.log('📝 Creating/updating Novu subscriber:', {
            subscriberId,
            firstName,
            lastName,
            email: userEmail,
            phone: userPhone,
            displayName: displayName || 'N/A',
            customData: Object.keys(customData).length > 0 ? customData : 'none',
            usingFallback: !userData?.email
          });
          
          // First, create/update subscriber profile in Novu with contact info and custom data
          const subscriberResult = await createOrUpdateNovuSubscriber({
            subscriberId: subscriberId,
            firstName: firstName,
            lastName: lastName,
            email: userEmail,
            phone: userPhone,
            novuSecretKey,
            customData: Object.keys(customData).length > 0 ? customData : undefined
          });

          if (!subscriberResult?.success) {
            console.error('❌ Failed to create/update Novu subscriber profile:', subscriberResult?.error);
          }

          // Wait a bit to ensure subscriber is fully created before updating credentials
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Update credentials with OneSignal device tokens for push notifications
          // Priority: subscriptionId > playerId
          // We need to fetch the actual OneSignal ID (onesignal_id) from OneSignal API
          const deviceTokenToFetch = oneSignalSubscriptionId || oneSignalPlayerId;
          let onesignalIdForDeviceToken = null;

          if (deviceTokenToFetch) {
            console.log('🔍 Fetching OneSignal ID from OneSignal API for device token:', deviceTokenToFetch);
            onesignalIdForDeviceToken = await fetchOneSignalIdFromOneSignal(deviceTokenToFetch);
            
            if (onesignalIdForDeviceToken) {
              console.log('✅ OneSignal ID retrieved:', onesignalIdForDeviceToken);
            } else {
              console.warn('⚠️ Could not fetch OneSignal ID, will try using device token directly');
              // Fallback: use the device token directly (might work if it's already a onesignal_id)
              onesignalIdForDeviceToken = deviceTokenToFetch;
            }
          }

          if (onesignalIdForDeviceToken) {
            const integrationIdentifier = process.env.NOVU_INTEGRATION_IDENTIFIER || process.env.NEXT_PUBLIC_NOVU_INTEGRATION_IDENTIFIER || null;

            const updateParams = {
              providerId: ChatOrPushProviderEnum.OneSignal,
              credentials: {
                deviceTokens: [onesignalIdForDeviceToken],
              },
            };

            // Add integrationIdentifier if provided
            if (integrationIdentifier) {
              updateParams.integrationIdentifier = integrationIdentifier;
            }

            try {
              await novu.subscribers.credentials.update(updateParams, subscriberId);

              console.log('✅ Novu subscriber credentials updated successfully:', {
                subscriberId,
                playerId: oneSignalPlayerId,
                subscriptionId: oneSignalSubscriptionId,
                onesignalId: onesignalIdForDeviceToken,
                integrationIdentifier,
              });
            } catch (credError) {
              console.error('❌ Error updating Novu credentials:', credError);
              
              // If subscription ID fails and we have player ID, try with player ID as fallback
              if (oneSignalPlayerId && oneSignalPlayerId !== deviceTokenToFetch) {
                console.log('🔄 Attempting fallback with player ID...');
                try {
                  const fallbackOnesignalId = await fetchOneSignalIdFromOneSignal(oneSignalPlayerId);
                  if (fallbackOnesignalId) {
                    const fallbackParams = {
                      ...updateParams,
                      credentials: {
                        deviceTokens: [fallbackOnesignalId],
                      },
                    };
                    await novu.subscribers.credentials.update(fallbackParams, subscriberId);
                    console.log('✅ Novu credentials updated with player ID fallback:', fallbackOnesignalId);
                  } else {
                    console.error('❌ Could not fetch OneSignal ID for player ID fallback');
                  }
                } catch (fallbackError) {
                  console.error('❌ Fallback also failed:', fallbackError);
                }
              }
            }
          } else {
            console.log('ℹ️ OneSignal subscription ID/token not available - subscriber created but credentials not updated');
            console.log('ℹ️ Push notifications will not work until device token is provided');
          }

          console.log('✅ Novu subscriber created/updated:', {
            subscriberId: subscriberId,
            email: userEmail,
            phone: userPhone,
            displayName: displayName || 'N/A',
            firstName: firstName,
            lastName: lastName
          });
        } else {
          console.warn('⚠️ Novu secret key not found. Skipping Novu subscriber creation.');
        }
      } catch (error) {
        console.error('❌ Error creating/updating Novu subscriber:', error);
        // Don't fail the auth request if Novu update fails
      }
    } else {
      console.warn('⚠️ Employee ID not available from ERPNext - skipping Novu subscriber creation');
    }


    return res.status(200).json({
      success: true,
      user: userData,
      token: token,
      userSource: userSource
    });

  } catch (error) {
    console.error('❌ ERPNext Auth Error:', error);
    return res.status(500).json({ 
      error: 'ERPNext authentication failed', 
      details: error.message 
    });
  }
} 