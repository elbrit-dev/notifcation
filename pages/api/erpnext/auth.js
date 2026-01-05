import { Novu } from '@novu/api';
import { ChatOrPushProviderEnum } from "@novu/api/models/components";

async function createOrUpdateNovuSubscriber({ subscriberId, firstName, lastName, email, phone, novuSecretKey }) {
  if (!subscriberId || !novuSecretKey) {
    console.warn('⚠️ Missing subscriberId or novuSecretKey for Novu subscriber creation');
    return;
  }

  const headers = {
    Authorization: `ApiKey ${novuSecretKey}`,
    'Content-Type': 'application/json',
    'idempotency-key': subscriberId
  };

  const payload = {
    subscriberId,
    firstName,
    lastName,
    email,
    phone
  };

  // Create subscriber (ignore if already exists via failIfExists flag)
  try {
    const createRes = await fetch(`https://api.novu.co/v2/subscribers?failIfExists=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (createRes.ok) {
      console.log('✅ Novu subscriber created successfully:', subscriberId);
    } else if (createRes.status === 409) {
      console.log('ℹ️ Novu subscriber already exists, will update:', subscriberId);
    } else {
      const errText = await createRes.text();
      console.warn('⚠️ Novu subscriber create failed:', createRes.status, errText);
    }
  } catch (err) {
    console.warn('⚠️ Novu subscriber create exception:', err);
  }

  // Update to ensure latest profile data
  try {
    const updateRes = await fetch(`https://api.novu.co/v2/subscribers/${encodeURIComponent(subscriberId)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    });

    if (updateRes.ok) {
      console.log('✅ Novu subscriber updated successfully:', subscriberId);
    } else {
      const errText = await updateRes.text();
      console.warn('⚠️ Novu subscriber update failed:', updateRes.status, errText);
    }
  } catch (err) {
    console.warn('⚠️ Novu subscriber update exception:', err);
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

  // Log received OneSignal IDs for debugging
  console.log('📥 Received OneSignal IDs from client:', {
    email: email || phoneNumber,
    oneSignalPlayerId: oneSignalPlayerId || 'NOT PROVIDED',
    oneSignalSubscriptionId: oneSignalSubscriptionId || 'NOT PROVIDED',
    playerIdType: typeof oneSignalPlayerId,
    subscriptionIdType: typeof oneSignalSubscriptionId,
    playerIdLength: oneSignalPlayerId ? oneSignalPlayerId.length : 0,
    subscriptionIdLength: oneSignalSubscriptionId ? oneSignalSubscriptionId.length : 0
  });

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

    // Get employeeId from ERPNext user data for subscriber ID
    const employeeId = userData?.customProperties?.employeeId || userData?.uid || userData?.employeeData?.name || null;
    
    // Create/update Novu subscriber if employeeId is present
    if (employeeId) {
      try {
        const novuSecretKey = process.env.NOVU_SECRET_KEY || process.env.NEXT_PUBLIC_NOVU_SECRET_KEY;
        
        if (novuSecretKey) {
          const novu = new Novu({
            secretKey: novuSecretKey,
            // Use serverURL for EU region if needed
            // serverURL: "https://eu.api.novu.co",
          });

          // Use employeeId as subscriber ID
          const subscriberId = employeeId;
          
          // TEST VALUES - Using sample data for testing
          const testFirstName = "Mounika";
          const testLastName = "M";
          const testEmail = "mounika@elbrit.org";
          const testPhone = "+919345405242";
          
          console.log('🧪 Using TEST VALUES for Novu subscriber:', {
            subscriberId,
            firstName: testFirstName,
            lastName: testLastName,
            email: testEmail,
            phone: testPhone
          });
          
          // First, create/update subscriber profile in Novu with contact info
          await createOrUpdateNovuSubscriber({
            subscriberId: subscriberId || "IN003",  // e.g., "IN003"
            firstName: testFirstName,      // e.g., "Mounika"
            lastName: testLastName,        // e.g., "M"
            email: testEmail,              // e.g., "mounika@elbrit.org"
            phone: testPhone,              // e.g., "+919345405242"
            novuSecretKey
          });

          // Then update credentials with OneSignal device tokens
          // Use ONLY onesignalId (Player ID) as device token - no fallback
          
          console.log('🔍 Checking OneSignal IDs for device token:', {
            subscriberId,
            oneSignalPlayerId: oneSignalPlayerId || 'NOT RECEIVED',
            oneSignalSubscriptionId: oneSignalSubscriptionId || 'NOT RECEIVED',
            playerIdType: typeof oneSignalPlayerId,
            subscriptionIdType: typeof oneSignalSubscriptionId,
            playerIdValue: oneSignalPlayerId,
            subscriptionIdValue: oneSignalSubscriptionId
          });
          
          // Validate and clean device token
          const cleanToken = (token) => {
            if (!token) return null;
            if (typeof token !== 'string') {
              console.warn('⚠️ Device token is not a string:', typeof token, token);
              return null;
            }
            const cleaned = token.trim();
            if (cleaned.length === 0) {
              console.warn('⚠️ Device token is empty after trimming');
              return null;
            }
            return cleaned;
          };
          
          const validPlayerId = cleanToken(oneSignalPlayerId);
          
          console.log('🔍 Device Token Validation:', {
            subscriberId,
            rawPlayerId: oneSignalPlayerId || 'NULL',
            validPlayerId: validPlayerId || 'INVALID',
            deviceTokenToUse: validPlayerId || 'NONE (onesignalId required)'
          });
          
          if (validPlayerId) {
            const integrationIdentifier = process.env.NOVU_INTEGRATION_IDENTIFIER || process.env.NEXT_PUBLIC_NOVU_INTEGRATION_IDENTIFIER || null;

            const updateParams = {
              providerId: ChatOrPushProviderEnum.OneSignal,
              credentials: {
                deviceTokens: [validPlayerId], // Using ONLY onesignalId (Player ID) as device token
              },
            };

            // Add integrationIdentifier if provided
            if (integrationIdentifier) {
              updateParams.integrationIdentifier = integrationIdentifier;
            }

            console.log('📤 Updating Novu credentials with device token:', {
              subscriberId,
              deviceToken: validPlayerId,
              tokenType: 'onesignalId (Player ID)',
              integrationIdentifier: integrationIdentifier || 'NOT SET',
              endpoint: `PUT /v2/subscribers/${subscriberId}/credentials`,
              fullParams: updateParams
            });

            try {
              // Wait a bit to ensure subscriber is fully created
              await new Promise((resolve) => setTimeout(resolve, 500));
              
              const credResult = await novu.subscribers.credentials.update(updateParams, subscriberId);

              console.log('✅ Novu Dashboard - Device Credentials Updated Successfully:', {
                subscriberId,
                status: 'Success',
                deviceToken: validPlayerId,
                tokenType: 'onesignalId (Player ID)',
                integrationIdentifier: integrationIdentifier || 'NOT SET',
                response: credResult || 'Success',
                dashboardUrl: `https://web.novu.co/subscribers/${subscriberId}`,
                pushChannelStatus: '✅ Active - Ready for push notifications'
              });

              // Verify the update by checking subscriber
              try {
                const verifySubscriber = await novu.subscribers.get(subscriberId);
                const hasPushChannel = verifySubscriber?.channels?.some(
                  channel => channel.providerId === 'onesignal' || channel.providerId === 'OneSignal'
                );
                console.log('🔍 Verification - Push Channel Status:', {
                  subscriberId,
                  hasPushChannel: hasPushChannel ? '✅ YES' : '❌ NO',
                  channels: verifySubscriber?.channels || 'No channels found'
                });
              } catch (verifyErr) {
                console.warn('⚠️ Could not verify push channel:', verifyErr.message);
              }
            } catch (credError) {
              console.error('❌ Novu Dashboard - Device Credentials Update Failed:', {
                subscriberId,
                error: credError.message || credError,
                errorStack: credError.stack,
                response: credError.response?.data || 'No response data',
                responseStatus: credError.response?.status,
                deviceToken: validPlayerId,
                integrationIdentifier,
                dashboardUrl: `https://web.novu.co/subscribers/${subscriberId}`,
                troubleshooting: [
                  '1. Check if subscriber exists in Novu Dashboard',
                  '2. Verify NOVU_SECRET_KEY is correct',
                  '3. Check if OneSignal integration is configured in Novu',
                  '4. Verify device token format is correct'
                ]
              });
            }
          } else {
            console.error('❌ OneSignal Player ID (onesignalId) not available:', {
              subscriberId,
              oneSignalPlayerId: oneSignalPlayerId || 'NULL',
              oneSignalSubscriptionId: oneSignalSubscriptionId || 'NULL',
              issue: 'Device token cannot be set - push notifications will fail',
              troubleshooting: [
                '1. Check browser console for OneSignal initialization',
                '2. Verify push notification permission is granted',
                '3. Check if OneSignal SDK is loaded correctly',
                '4. Look for OneSignal ID retrieval errors in browser console'
              ]
            });
          }

          console.log('✅ Novu subscriber created/updated:', {
            subscriberId: employeeId,
            email: userData.email,
            phone: userData.phoneNumber,
            displayName: userData.displayName
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