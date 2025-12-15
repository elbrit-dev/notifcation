export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ERPNext API configuration
    const erpnextUrl = process.env.ERPNEXT_URL;
    const erpnextApiKey = process.env.ERPNEXT_API_KEY;
    const erpnextApiSecret = process.env.ERPNEXT_API_SECRET;

    console.log('🧪 Testing ERPNext API connectivity...');
    console.log('🔧 Config:', { 
      url: erpnextUrl, 
      hasApiKey: !!erpnextApiKey, 
      hasApiSecret: !!erpnextApiSecret 
    });

    if (!erpnextUrl || !erpnextApiKey || !erpnextApiSecret) {
      return res.status(500).json({ error: 'ERPNext configuration missing' });
    }

    // Test 1: Check if we can access the Employee table
    console.log('🧪 Test 1: Checking Employee table access...');
    const employeeTestUrl = `${erpnextUrl}/api/resource/Employee`;
    const employeeTestParams = new URLSearchParams({
      filters: JSON.stringify([['status', '=', 'Active']]),
      fields: JSON.stringify(['name', 'first_name', 'company_email']),
      limit: 1
    });

    const employeeTestResponse = await fetch(`${employeeTestUrl}?${employeeTestParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Employee Test Response Status:', employeeTestResponse.status);
    
    if (employeeTestResponse.ok) {
      const employeeTestResult = await employeeTestResponse.json();
      console.log('✅ Employee table access successful:', employeeTestResult);
      
      // Test 2: Search for specific email
      console.log('🧪 Test 2: Searching for baranidharan@elbrit.org...');
      const searchTestParams = new URLSearchParams({
        filters: JSON.stringify([['company_email', '=', 'baranidharan@elbrit.org']]),
        fields: JSON.stringify(['name', 'first_name', 'company_email', 'cell_number', 'fsl_whatsapp_number'])
      });

      // Test 3: Search for phone number
      console.log('🧪 Test 3: Searching for phone number 9092404522...');
      const phoneTestParams = new URLSearchParams({
        filters: JSON.stringify([['cell_number', '=', '9092404522']]),
        fields: JSON.stringify(['name', 'first_name', 'company_email', 'cell_number', 'fsl_whatsapp_number'])
      });

      const searchTestResponse = await fetch(`${employeeTestUrl}?${searchTestParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Search Test Response Status:', searchTestResponse.status);
      
      let searchResult = null;
      if (searchTestResponse.ok) {
        searchResult = await searchTestResponse.json();
        console.log('✅ Search result:', searchResult);
      } else {
        const errorText = await searchTestResponse.text();
        console.error('❌ Search failed:', errorText);
      }

      // Test phone search
      const phoneTestResponse = await fetch(`${employeeTestUrl}?${phoneTestParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${erpnextApiKey}:${erpnextApiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Phone Test Response Status:', phoneTestResponse.status);
      
      let phoneResult = null;
      if (phoneTestResponse.ok) {
        phoneResult = await phoneTestResponse.json();
        console.log('✅ Phone search result:', phoneResult);
      } else {
        const errorText = await phoneTestResponse.text();
        console.error('❌ Phone search failed:', errorText);
      }

      return res.status(200).json({
        success: true,
        message: 'ERPNext API is working correctly',
        employeeTest: {
          status: employeeTestResponse.status,
          dataCount: employeeTestResult.data?.length || 0,
          sampleData: employeeTestResult.data?.[0] || null
        },
        searchTest: {
          status: searchTestResponse.status,
          dataCount: searchResult?.data?.length || 0,
          foundEmployee: searchResult?.data?.[0] || null,
          searchQuery: 'baranidharan@elbrit.org'
        },
        phoneTest: {
          status: phoneTestResponse.status,
          dataCount: phoneResult?.data?.length || 0,
          foundEmployee: phoneResult?.data?.[0] || null,
          searchQuery: '9092404522'
        }
      });
    } else {
      const errorText = await employeeTestResponse.text();
      console.error('❌ Employee table access failed:', errorText);
      
      return res.status(employeeTestResponse.status).json({
        success: false,
        error: 'Employee table access failed',
        status: employeeTestResponse.status,
        details: errorText
      });
    }

  } catch (error) {
    console.error('❌ ERPNext API Test Error:', error);
    return res.status(500).json({ 
      error: 'ERPNext API test failed', 
      details: error.message 
    });
  }
} 