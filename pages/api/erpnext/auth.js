import { Novu } from '@novu/api';
import { ChatOrPushProviderEnum } from "@novu/api/models/components";

/**
 * Fetch full OneSignal user data from OneSignal API using Player ID or Subscription ID
 * @param {string} deviceToken - OneSignal Player ID or Subscription ID
 * @returns {Promise<{onesignalId: string, externalId: string, firstName: string, lastName: string, phone: string, email: string} | null>} - Returns full user data or null
 */
async function fetchOneSignalUserData(deviceToken) {
  if (!deviceToken) {
    return null;
  }

  const oneSignalAppId = process.env.ONESIGNAL_APP_ID || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'ae84e191-00f5-445c-8e43-173709b8a553';
  const oneSignalApiKey = process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY;

  if (!oneSignalApiKey) {
    console.warn('⚠️ OneSignal REST API key not configured. Cannot fetch OneSignal user data.');
    return null;
  }

  try {
    console.log('🔍 Fetching OneSignal user data from OneSignal API for deviceToken:', deviceToken);

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
    }

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.warn('⚠️ OneSignal user fetch failed:', userResponse.status, errorText);
      return null;
    }

    const userData = await userResponse.json();
    console.log('📊 OneSignal user data retrieved:', JSON.stringify(userData, null, 2));

    // Extract data from OneSignal response
    const onesignalId = userData.identity?.onesignal_id || null;
    const externalId = userData.identity?.external_id || null;
    
    // Extract name from tags or properties
    const tags = userData.properties?.tags || {};
    const name = tags.name || tags.Name || tags.full_name || tags.fullName || null;
    
    // Parse name into firstName and lastName
    let firstName = tags.first_name || tags.firstName || tags.FirstName || null;
    let lastName = tags.last_name || tags.lastName || tags.LastName || null;
    
    if (name && !firstName) {
      const nameParts = name.trim().split(' ');
      firstName = nameParts[0] || null;
      lastName = nameParts.slice(1).join(' ') || null;
    }
    
    // Extract phone from subscriptions or tags
    let phone = null;
    const subscriptions = userData.subscriptions || [];
    const smsSubscription = subscriptions.find(sub => sub.type === 'SMS' && sub.enabled && sub.token);
    if (smsSubscription) {
      phone = smsSubscription.token;
    } else if (tags.phone || tags.phoneNumber || tags.Phone) {
      phone = tags.phone || tags.phoneNumber || tags.Phone;
    }
    
    // Extract email from subscriptions or tags
    let email = null;
    const emailSubscription = subscriptions.find(sub => sub.type === 'Email' && sub.enabled && sub.token);
    if (emailSubscription) {
      email = emailSubscription.token;
    } else if (tags.email || tags.Email) {
      email = tags.email || tags.Email;
    }

    if (!onesignalId) {
      console.warn('⚠️ OneSignal ID not found in response');
      return null;
    }

    const result = {
      onesignalId,
      externalId,
      firstName,
      lastName,
      phone,
      email
    };

    console.log('✅ OneSignal user data extracted:', result);
    return result;

  } catch (error) {
    console.error('❌ Error fetching OneSignal user data:', error);
    return null;
  }
}

/**
 * Fetch OneSignal ID (onesignal_id) from OneSignal API using Player ID or Subscription ID
 * @param {string} deviceToken - OneSignal Player ID or Subscription ID
 * @returns {Promise<string | null>} - Returns OneSignal ID (onesignal_id) or null
 */
async function fetchOneSignalIdFromOneSignal(deviceToken) {
  const userData = await fetchOneSignalUserData(deviceToken);
  return userData?.onesignalId || null;
}

async function createOrUpdateNovuSubscriber({ subscriberId, firstName, lastName, email, phone, novuSecretKey, customData }) {
  if (!subscriberId || !novuSecretKey) {
    console.warn('⚠️ Missing subscriberId or novuSecretKey for Novu subscriber creation');
    return;
  }

  const headers = {
    Authorization: `ApiKey ${novuSecretKey}`,
    'Content-Type': 'application/json',
    'idempotency-key': subscriberId
  };

  // Build payload with actual values or fallback defaults
  const payload = {
    subscriberId: String(subscriberId)
  };
  
  // Set values - use provided values if they exist and are not empty, otherwise use defaults
  payload.firstName = (firstName && firstName.trim()) || "Mounika";
  payload.lastName = (lastName && lastName.trim()) || "M";
  payload.email = (email && email.trim()) || "mounika@elbrit.org";
  payload.phone = (phone && phone.trim()) || "+919345405242";
  
  // Add custom data if provided
  if (customData && typeof customData === 'object') {
    payload.data = customData;
  }

  console.log('📤 Step 1: Creating subscriber with payload:', JSON.stringify(payload, null, 2));

  // Create subscriber (ignore if already exists via failIfExists flag)
  let createSuccess = false;
  try {
    const createRes = await fetch(`https://api.novu.co/v2/subscribers?failIfExists=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (createRes.ok) {
      const createData = await createRes.json().catch(() => null);
      console.log('✅ Step 1: Novu subscriber created successfully:', subscriberId);
      createSuccess = true;
    } else if (createRes.status === 409) {
      console.log('ℹ️ Step 1: Novu subscriber already exists (status 409), proceeding to update:', subscriberId);
      createSuccess = true; // Subscriber exists, we can update
    } else {
      const errText = await createRes.text();
      console.warn('⚠️ Step 1: Novu subscriber create failed:', createRes.status, errText);
    }
  } catch (err) {
    console.error('❌ Step 1: Novu subscriber create exception:', err);
  }

  // Wait a bit longer to ensure subscriber is fully created/ready before updating
  console.log('⏳ Waiting 1 second before update...');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Step 2: ALWAYS update to ensure latest profile data (even if create succeeded)
  console.log('📤 Step 2: Updating Novu subscriber with latest data:', JSON.stringify(payload, null, 2));
  
  try {
    const updateRes = await fetch(`https://api.novu.co/v2/subscribers/${encodeURIComponent(subscriberId)}`, {
      method: 'PUT',
      headers: {
        Authorization: `ApiKey ${novuSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await updateRes.text();
    let updateData = null;
    try {
      updateData = JSON.parse(responseText);
    } catch (e) {
      // Response might not be JSON
    }

    console.log('📥 Step 2: Update Response Status:', updateRes.status);
    console.log('📥 Step 2: Update Response Text:', responseText);

    if (updateRes.ok) {
      console.log('✅ Step 2: Novu subscriber UPDATED successfully:', {
        subscriberId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        response: updateData || responseText,
        status: updateRes.status
      });
      
      // Verify the update by fetching the subscriber
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const verifyRes = await fetch(`https://api.novu.co/v2/subscribers/${encodeURIComponent(subscriberId)}`, {
          method: 'GET',
          headers: {
            Authorization: `ApiKey ${novuSecretKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          console.log('✅ Step 3: Verification - Current subscriber data:', {
            subscriberId: verifyData.data?.subscriberId,
            firstName: verifyData.data?.firstName,
            lastName: verifyData.data?.lastName,
            email: verifyData.data?.email,
            phone: verifyData.data?.phone
          });
        }
      } catch (verifyErr) {
        console.warn('⚠️ Step 3: Could not verify subscriber update:', verifyErr.message);
      }
    } else {
      console.error('❌ Step 2: Novu subscriber update FAILED:', {
        status: updateRes.status,
        statusText: updateRes.statusText,
        error: responseText,
        payload: JSON.stringify(payload, null, 2),
        subscriberId: subscriberId
      });
    }
  } catch (err) {
    console.error('❌ Step 2: Novu subscriber update exception:', {
      error: err.message,
      stack: err.stack,
      payload: JSON.stringify(payload, null, 2)
    });
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
    const employeeId = userData?.customProperties?.employeeId || userData?.uid || userData?.employeeData?.name || "IN003";
    
    const subscriberFirstName = userData.firstName || "Mounika";
    const subscriberLastName = userData.lastName || "M";
    const subscriberEmail = userData.email || "mounika@elbrit.org";
    const subscriberPhone = userData.phoneNumber || "+919345405242";
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

          // Use employeeId as subscriber ID (can be updated with OneSignal externalId)
          let subscriberId = employeeId;
          let FirstName = userData.firstName || "Mounika";
          let LastName = userData.lastName || "M";
          let email = userData.email || "mounika@elbrit.org";
          let phone = userData.phoneNumber || "+919345405242";
          
          // Log raw userData for debugging
          console.log('🔍 Raw userData from ERPNext:', {
            firstName: FirstName,
            lastName: LastName,
            email: email,
            phone: phone,
          });
          
          // Extract user data from ERPNext for subscriber
          // Use actual user data, with fallback to test values if not available
          
          
          console.log('📝 Extracted subscriber data for Novu:', {
            subscriberId,
            firstName: subscriberFirstName,
            lastName: subscriberLastName,
            email: subscriberEmail,
            phone: subscriberPhone,
            source: {
              firstName: userData.displayName ? 'displayName' : userData.firstName ? 'firstName' : userData.employeeData?.first_name ? 'employeeData.first_name' : 'FALLBACK',
              lastName: userData.displayName ? 'displayName' : userData.lastName ? 'lastName' : userData.employeeData?.last_name ? 'employeeData.last_name' : 'FALLBACK',
              email: userData.email ? 'email' : userData.employeeData?.company_email ? 'employeeData.company_email' : 'FALLBACK',
              phone: userData.phoneNumber ? 'phoneNumber' : userData.employeeData?.cell_number ? 'cell_number' : userData.employeeData?.fsl_whatsapp_number ? 'fsl_whatsapp_number' : 'FALLBACK'
            }
          });
          
          // First, create/update subscriber profile in Novu with contact info
          await createOrUpdateNovuSubscriber({
            subscriberId: subscriberId || "IN003",
            firstName: subscriberFirstName||"Mounika",
            lastName: subscriberLastName||"M",
            email: subscriberEmail||"mounika@elbrit.org",
            phone: subscriberPhone||"+919345405242",
            novuSecretKey
          });

          // Then update credentials with OneSignal device tokens
          // Use ONLY OneSignal ID (onesignal_id) as device token - NO FALLBACK to subscription ID
          
          console.log('🔍 Checking OneSignal IDs for device token:', {
            subscriberId,
            oneSignalPlayerId: oneSignalPlayerId || 'NOT RECEIVED',
            oneSignalSubscriptionId: oneSignalSubscriptionId || 'NOT RECEIVED',
            playerIdType: typeof oneSignalPlayerId,
            subscriptionIdType: typeof oneSignalSubscriptionId
          });
          
          // Get deviceToken to use for fetching OneSignal user data
          const deviceTokenToFetch = oneSignalPlayerId;
          
          // Fetch full OneSignal user data from OneSignal API
          let onesignalUserData = null;
          let onesignalId = null;
          if (deviceTokenToFetch) {
            console.log('📱 Fetching OneSignal user data from OneSignal API...');
            onesignalUserData = await fetchOneSignalUserData(deviceTokenToFetch);
            
            if (onesignalUserData && onesignalUserData.onesignalId) {
              console.log('✅ OneSignal user data retrieved from OneSignal API:', onesignalUserData);
              onesignalId = onesignalUserData.onesignalId;
              
              // If OneSignal user data is available and has externalId, use it to create/update subscriber
              if (onesignalUserData.externalId) {
                console.log('🔄 Using OneSignal data to create/update subscriber:', {
                  subscriberId: onesignalUserData.externalId,
                  firstName: onesignalUserData.firstName,
                  lastName: onesignalUserData.lastName,
                  phone: onesignalUserData.phone,
                  email: onesignalUserData.email,
                  onesignalId: onesignalUserData.onesignalId
                });
                
                // Create/update subscriber using OneSignal data
                await createOrUpdateNovuSubscriber({
                  subscriberId: onesignalUserData.externalId,
                  firstName: onesignalUserData.firstName || "Mounika",
                  lastName: onesignalUserData.lastName || "M",
                  email: onesignalUserData.email || "mounika@elbrit.org",
                  phone: onesignalUserData.phone || "+919345405242",
                  novuSecretKey,
                  customData: {
                    onesignalId: onesignalUserData.onesignalId
                  }
                });
                
                // Update subscriberId to use OneSignal externalId for credentials update
                subscriberId = onesignalUserData.externalId;
              }
            } else {
              console.error('❌ OneSignal user data not available from OneSignal API:', {
                subscriberId,
                deviceTokenUsed: deviceTokenToFetch,
                oneSignalPlayerId: oneSignalPlayerId || 'NULL',
                oneSignalSubscriptionId: oneSignalSubscriptionId || 'NULL',
                error: 'Could not fetch OneSignal user data from OneSignal API',
                action: 'Skipping device token update - push notifications will not work'
              });
            }
          } else {
            console.error('❌ No device token provided to fetch OneSignal user data:', {
              subscriberId,
              oneSignalPlayerId: oneSignalPlayerId || 'NULL',
              oneSignalSubscriptionId: oneSignalSubscriptionId || 'NULL',
              error: 'No device token available to fetch OneSignal user data',
              action: 'Skipping device token update - push notifications will not work'
            });
          }
          
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
          
          const validOneSignalId = cleanToken(onesignalId);
          
          console.log('🔍 Device Token Validation:', {
            subscriberId,
            onesignalIdFromAPI: onesignalId || 'NULL',
            validOneSignalId: validOneSignalId || 'INVALID',
            deviceTokenToUse: validOneSignalId || 'NONE (OneSignal ID required - no fallback)'
          });
          
          if (validOneSignalId) {
            const integrationIdentifier = process.env.NOVU_INTEGRATION_IDENTIFIER || process.env.NEXT_PUBLIC_NOVU_INTEGRATION_IDENTIFIER || null;

            const updateParams = {
              providerId: ChatOrPushProviderEnum.OneSignal,
              credentials: {
                deviceTokens: [validOneSignalId], // Using ONLY OneSignal ID (onesignal_id) as device token
              },
            };

            // Add integrationIdentifier if provided
            if (integrationIdentifier) {
              updateParams.integrationIdentifier = integrationIdentifier;
            }

            console.log('📤 Updating Novu credentials with OneSignal ID as device token:', {
              subscriberId,
              deviceToken: validOneSignalId,
              tokenType: 'OneSignal ID (onesignal_id) from OneSignal API',
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
                deviceToken: validOneSignalId,
                tokenType: 'OneSignal ID (onesignal_id) from OneSignal API',
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
                deviceToken: validOneSignalId,
                integrationIdentifier,
                dashboardUrl: `https://web.novu.co/subscribers/${subscriberId}`,
                troubleshooting: [
                  '1. Check if subscriber exists in Novu Dashboard',
                  '2. Verify NOVU_SECRET_KEY is correct',
                  '3. Check if OneSignal integration is configured in Novu',
                  '4. Verify device token format is correct',
                  '5. Check if OneSignal REST API key is configured'
                ]
              });
            }
          } else {
            console.error('❌ OneSignal ID (onesignal_id) not available from OneSignal API:', {
              subscriberId,
              oneSignalPlayerId: oneSignalPlayerId || 'NULL',
              oneSignalSubscriptionId: oneSignalSubscriptionId || 'NULL',
              onesignalIdFromAPI: onesignalId || 'NULL',
              issue: 'OneSignal ID not fetched from OneSignal API - device token cannot be set',
              action: 'Push notifications will fail - OneSignal ID is required (no fallback to subscription ID)',
              troubleshooting: [
                '1. Check if OneSignal REST API key is configured (ONESIGNAL_REST_API_KEY)',
                '2. Verify the deviceToken (player ID or subscription ID) is valid',
                '3. Check OneSignal API response for errors',
                '4. Ensure user exists in OneSignal dashboard',
                '5. Verify OneSignal App ID is correct'
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