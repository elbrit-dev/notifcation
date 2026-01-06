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

  // Build payload - only include non-null, non-undefined values
  const payload = {
    subscriberId: String(subscriberId)
  };
  
  // Only add fields if they have actual values
  if (firstName && firstName.trim()) payload.firstName = firstName.trim();
  if (lastName && lastName.trim()) payload.lastName = lastName.trim();
  if (email && email.trim()) payload.email = email.trim();
  if (phone && phone.trim()) payload.phone = phone.trim();

  console.log('📤 Creating Novu subscriber with payload:', JSON.stringify(payload, null, 2));

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

  // Wait a bit to ensure subscriber is fully created before updating
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Update to ensure latest profile data
  console.log('📤 Updating Novu subscriber with payload:', JSON.stringify(payload, null, 2));
  
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

    if (updateRes.ok) {
      console.log('✅ Novu subscriber updated successfully:', {
        subscriberId,
        firstName: payload.firstName || 'NOT SET',
        lastName: payload.lastName || 'NOT SET',
        email: payload.email || 'NOT SET',
        phone: payload.phone || 'NOT SET',
        response: updateData || responseText
      });
    } else {
      console.error('❌ Novu subscriber update FAILED:', {
        status: updateRes.status,
        statusText: updateRes.statusText,
        error: responseText,
        payload: JSON.stringify(payload, null, 2)
      });
    }
  } catch (err) {
    console.error('❌ Novu subscriber update exception:', err);
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

  console.log('📥 OneSignal IDs received:', {
    email: email || phoneNumber,
    oneSignalPlayerId: oneSignalPlayerId || 'NOT PROVIDED',
    oneSignalSubscriptionId: oneSignalSubscriptionId || 'NOT PROVIDED'
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

    // Always search by company_email for role-based access
    // For Microsoft SSO: use email directly as company_email
    // For Phone Auth: get company_email from Employee data first, then search
    let companyEmail = email; // Default for Microsoft SSO
    let searchValue = email;

    // If phone authentication, we need to get the employee data by phone number first
    let employeeIdFromPhone = null;
    if (phoneNumber && !email) {
      console.log('📱 Phone authentication - searching for employee by phone number');
      
      const cleanedPhoneNumber = phoneNumber.replace(/^\+91/, '').replace(/^\+/, '');
      
      // Search Employee table by phone number to get employee ID
      const employeeSearchUrl = `${erpnextUrl}/api/resource/Employee`;
      const employeeSearchParams = new URLSearchParams({
        filters: JSON.stringify([
          ['cell_number', '=', cleanedPhoneNumber]
        ]),
        fields: JSON.stringify(['name', 'first_name', 'cell_number', 'fsl_whatsapp_number', 'company_email', 'kly_role_id', 'status'])
      });

      const employeeResponse = await fetch(`${employeeSearchUrl}?${employeeSearchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (employeeResponse.ok) {
        const employeeResult = await employeeResponse.json();

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
          
          employeeIdFromPhone = employee.name;
          if (employee.company_email) {
            companyEmail = employee.company_email;
            searchValue = companyEmail;
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

    if (employeeIdFromPhone) {
      const employeeUrl = `${erpnextUrl}/api/resource/Employee/${employeeIdFromPhone}`;
      const employeeResponse = await fetch(employeeUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (employeeResponse.ok) {
        const employeeResult = await employeeResponse.json();
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
        }
      }
    } 
    else if (searchValue) {
      const employeeSearchUrl = `${erpnextUrl}/api/resource/Employee`;
      const employeeSearchParams = new URLSearchParams({
        filters: JSON.stringify([['company_email', '=', searchValue]]),
        fields: JSON.stringify(['name', 'first_name', 'employee_name', 'cell_number', 'fsl_whatsapp_number', 'company_email', 'kly_role_id', 'status', 'department', 'designation', 'date_of_joining', 'date_of_birth'])
      });
      
      const employeeResponse = await fetch(`${employeeSearchUrl}?${employeeSearchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (employeeResponse.ok) {
        const employeeResult = await employeeResponse.json();
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
        }
      }
    }

    if (!userData) {
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

          const subscriberId = employeeId;
          const subscriberFirstName = userData.displayName?.split(' ')[0] || userData.firstName || "Mounika";
          const subscriberLastName = userData.displayName?.split(' ').slice(1).join(' ') || userData.lastName || "M";
          const subscriberEmail = userData.email || "mounika@elbrit.org";
          const subscriberPhone = userData.phoneNumber || "+919345405242";
          
          console.log('📝 Subscriber data extracted from ERPNext:', {
            subscriberId,
            firstName: subscriberFirstName,
            lastName: subscriberLastName,
            email: subscriberEmail,
            phone: subscriberPhone,
            source: {
              firstName: userData.displayName ? 'displayName' : userData.firstName ? 'firstName' : 'FALLBACK',
              lastName: userData.displayName ? 'displayName' : userData.lastName ? 'lastName' : 'FALLBACK',
              email: userData.email ? 'email' : 'FALLBACK',
              phone: userData.phoneNumber ? 'phoneNumber' : 'FALLBACK'
            }
          });
          
          await createOrUpdateNovuSubscriber({
            subscriberId: subscriberId || "IN003",
            firstName: subscriberFirstName,
            lastName: subscriberLastName,
            email: subscriberEmail,
            phone: subscriberPhone,
            novuSecretKey
          });

          if (oneSignalPlayerId && typeof oneSignalPlayerId === 'string' && oneSignalPlayerId.trim()) {
            const validPlayerId = oneSignalPlayerId.trim();
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

            try {
              await novu.subscribers.credentials.update(updateParams, subscriberId);
              console.log('✅ Novu credentials updated:', subscriberId);
            } catch (credError) {
              console.error('❌ Novu credentials update failed:', credError.message);
            }
          }
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