// Simple in-memory cache for small read responses (valid for warm instances)
const __memoryCache = new Map();
const getFromCache = (key, ttlMs) => {
  const entry = __memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) {
    __memoryCache.delete(key);
    return null;
  }
  return entry.value;
};
const setInCache = (key, value) => {
  __memoryCache.set(key, { ts: Date.now(), value });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, configKey, pivotConfig, userId, userRole, filterByPage, filterByTable, listBy } = req.body;
  
  // Admin user role ID - only this role can perform write operations
  const ADMIN_ROLE_ID = '6c2a85c7-116e-43b3-a4ff-db11b7858487';
  
  // Enhanced admin check that considers multiple role properties
  const isAdminUser = (role, roleIds, roleName) => {
    const userRoleIds = roleIds || [];
    return role === ADMIN_ROLE_ID || 
           userRoleIds.includes(ADMIN_ROLE_ID) ||
           (roleName === 'Admin' && role === ADMIN_ROLE_ID);
  };
  
  const userIsAdmin = isAdminUser(userRole, req.body.userRoleIds, req.body.userRoleName);
  
  // Use CMS database ID for CMS operations (using your actual environment variables)
  const cmsDbId = process.env.PLASMIC_CMS_DATABASE_ID || 'uP7RbyUnivSX75FTKL9RLp';
  const tableId = process.env.PLASMIC_TABLE_CONFIGS_ID || 'o4o5VRFTDgHHmQ31fCfkuz';
  // For CMS operations, use the CMS Secret Token (for write operations)
  const cmsSecretToken = process.env.PLASMIC_CMS_SECRET_TOKEN;
  // For read operations, use the CMS Public Token
  const cmsPublicToken = process.env.PLASMIC_CMS_PUBLIC_TOKEN;
  
  // Helper function to create user context for API calls (Plasmic CMS API format)
  const getUserHeaders = (useSecretToken = true) => {
    const token = useSecretToken ? cmsSecretToken : cmsPublicToken;
    const headers = {
      'Content-Type': 'application/json',
      // Plasmic CMS API requires this specific header format: CMS_ID:TOKEN
      'x-plasmic-api-cms-tokens': `${cmsDbId}:${token}`
    };
    
    if (userId) {
      headers['x-plasmic-api-user'] = JSON.stringify({
        email: userId,
        id: userRole || userId
      });
    }
    
    return headers;
  };

    // Enhanced error checking

  if (!cmsDbId || !cmsSecretToken || !cmsPublicToken) {
    const missingVars = [];
    if (!cmsDbId) missingVars.push('PLASMIC_CMS_DATABASE_ID');
    if (!cmsSecretToken) missingVars.push('PLASMIC_CMS_SECRET_TOKEN');
    if (!cmsPublicToken) missingVars.push('PLASMIC_CMS_PUBLIC_TOKEN');
    
    console.error('❌ Missing Plasmic CMS configuration:', missingVars);
    return res.status(500).json({ 
      error: 'Plasmic CMS configuration missing',
      missingVariables: missingVars,
      note: 'Please set up your environment variables in .env.local'
    });
  }

  try {
    if (action === 'save') {
      // Check if user has admin permissions for write operations
      if (!userIsAdmin) {
        console.log('🚫 Admin check failed:', {
          userRole,
          userRoleIds: req.body.userRoleIds,
          userRoleName: req.body.userRoleName,
          requiredRole: ADMIN_ROLE_ID,
          isAdmin: userIsAdmin
        });
        
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'Only admin users can save pivot configurations',
          userRole,
          userRoleIds: req.body.userRoleIds,
          userRoleName: req.body.userRoleName,
          requiredRole: ADMIN_ROLE_ID
        });
      }
      
      // Save configuration to CMS
      const saveData = {
        configKey,
        pivotConfig,
        pageName: req.body.pageName || configKey.split('_')[0] || 'dashboard',
        tableName: req.body.tableName || configKey.split('_')[1] || 'Table',
        userId: req.body.userId || null,
        userRole: req.body.userRole || null,
        updatedAt: new Date().toISOString()
      };



      // NEW APPROACH: Try direct creation first, then handle duplicates
      let result;
      let attemptedQuery = false;

      try {
        // First, let's test the CMS Secret Token by checking database access
        const testUrl = `https://data.plasmic.app/api/v1/cms/databases/${cmsDbId}`;
        const testResponse = await fetch(testUrl, {
          headers: getUserHeaders()
        });
        if (!testResponse.ok) {
          const testError = await testResponse.text();
        }

        // Attempt direct creation first (faster and avoids query permission issues)
        // Add ?publish=1 to make data immediately available to the app
        const createUrl = `https://data.plasmic.app/api/v1/cms/databases/${cmsDbId}/tables/${tableId}/rows?publish=1`;
        
        // Format data according to Plasmic CMS API spec: wrap in rows array with data property
        const cmsCreateData = {
          rows: [
            {
              data: {
                configKey: saveData.configKey,
                pivotConfig: JSON.stringify(saveData.pivotConfig),
                pageName: saveData.pageName,
                tableName: saveData.tableName,
                userId: saveData.userId,
                userRole: saveData.userRole,
                updatedAt: saveData.updatedAt
              }
            }
          ]
        };
        
        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers: getUserHeaders(true), // Use secret token for writes
          body: JSON.stringify(cmsCreateData)
        });

        if (createResponse.ok) {
          result = await createResponse.json();
          return res.status(200).json({ success: true, data: result, method: 'direct_create' });
        } else {
          const errorText = await createResponse.text();
          
          if (createResponse.status === 409 || createResponse.status === 400) {
            // Conflict/Bad Request - record might already exist, try to find and update it
            attemptedQuery = true;
          } else {
            throw new Error(`Create failed: ${createResponse.status} - ${errorText}`);
          }
        }
      } catch (directCreateError) {
        attemptedQuery = true;
      }

      // If direct creation failed with conflict, try query approach
      if (attemptedQuery) {
        try {
          // Create query URL with parameters (GET method for reading)
          const queryParams = new URLSearchParams({
            q: JSON.stringify({
              where: {
                configKey: configKey
              },
              limit: 1
            })
          });
          const queryUrl = `https://data.plasmic.app/api/v1/cms/databases/${cmsDbId}/tables/${tableId}/query?${queryParams}`;
          console.log('🔍 Querying for existing record at:', queryUrl);
          
          const queryResponse = await fetch(queryUrl, {
            method: 'GET',
            headers: getUserHeaders(true) // Use secret token for consistency (can read with secret token)
          });

          console.log('📡 Query response status:', queryResponse.status);

          if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
            console.log('📊 Query result:', queryResult);
      const existingRecord = queryResult?.rows?.[0];

      if (existingRecord) {
        // Update existing record using the row ID and correct API endpoint
              const updateUrl = `https://data.plasmic.app/api/v1/cms/rows/${existingRecord.id}?publish=1`;
              console.log('🔄 Updating existing record at:', updateUrl);
              
              // Format data for update according to Plasmic CMS API spec
              const cmsUpdateData = {
                data: {
                  configKey: saveData.configKey,
                  pivotConfig: JSON.stringify(saveData.pivotConfig),
                  pageName: saveData.pageName,
                  tableName: saveData.tableName,
                  userId: saveData.userId,
                  userRole: saveData.userRole,
                  updatedAt: saveData.updatedAt
                }
              };
              
              console.log('📊 CMS Update Data:', JSON.stringify(cmsUpdateData, null, 2));
              
              const updateResponse = await fetch(updateUrl, {
                method: 'PUT',
                headers: getUserHeaders(true), // Use secret token for writes
                body: JSON.stringify(cmsUpdateData)
              });

              console.log('📝 Update response status:', updateResponse.status);

              if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                console.error('❌ Update failed:', updateResponse.status, errorText);
                console.error('📊 Update data sent:', JSON.stringify(cmsUpdateData, null, 2));
                throw new Error(`Update failed: ${updateResponse.status} - ${errorText}`);
              }

              result = await updateResponse.json();
              console.log('✅ Update successful:', result);
              return res.status(200).json({ success: true, data: result, method: 'update' });
      } else {
              // Query succeeded but no record found - this shouldn't happen after direct create failed
              console.log('🤔 Query succeeded but no existing record found - retrying direct create');
              
              const retryCreateResponse = await fetch(`https://data.plasmic.app/api/v1/cms/databases/${cmsDbId}/tables/${tableId}/rows?publish=1`, {
                method: 'POST',
                headers: getUserHeaders(true), // Use secret token for writes
                body: JSON.stringify(cmsCreateData)
              });

              if (!retryCreateResponse.ok) {
                const errorText = await retryCreateResponse.text();
                console.error('❌ Retry create failed:', retryCreateResponse.status, errorText);
                throw new Error(`Retry create failed: ${retryCreateResponse.status} - ${errorText}`);
              }

              result = await retryCreateResponse.json();
              console.log('✅ Retry create successful:', result);
              return res.status(200).json({ success: true, data: result, method: 'retry_create' });
            }
          } else {
            const errorText = await queryResponse.text();
            console.error('❌ Query failed:', queryResponse.status, errorText);
            
            // If query fails but we have the right table structure, suggest manual creation
            if (queryResponse.status === 404) {
              return res.status(500).json({ 
                error: 'CMS table query failed', 
                details: `Query failed: ${queryResponse.status} - ${errorText}`,
                suggestion: 'Table exists but query permissions may be missing. Try creating a record manually in Plasmic CMS first.',
                tableUrl: `https://studio.plasmic.app/cms/${cmsDbId}/content/models/${tableId}`,
                debugInfo: {
                  cmsDbId,
                  tableId,
                  queryUrl,
                  configKey
                }
              });
            }
            
            throw new Error(`Query failed: ${queryResponse.status} - ${errorText}`);
          }
        } catch (queryError) {
          console.error('❌ Query approach also failed:', queryError.message);
          
          // Return helpful error with suggestion
          return res.status(500).json({ 
            error: 'CMS operation failed', 
            details: queryError.message,
            suggestion: 'Both direct creation and query approaches failed. Please check API token permissions or create a test record manually in Plasmic CMS.',
            tableUrl: `https://studio.plasmic.app/cms/${cmsDbId}/content/models/${tableId}`,
            debugInfo: {
              cmsDbId,
              tableId,
              configKey,
              directCreateAttempted: true,
              queryAttempted: attemptedQuery
            }
          });
        }
      }

    } else if (action === 'load') {
      // Try in-memory cache first (60s TTL)
      const cacheKey = `load:${configKey}:${req.body.filterByPage || ''}:${req.body.filterByTable || ''}`;
      const cached = getFromCache(cacheKey, 60 * 1000);
      if (cached) {
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
        return res.status(200).json({ success: true, data: cached, cached: true });
      }
      // Load configuration from CMS using GET method with public token
      let whereClause = { configKey: configKey };
      
      // Add filters for page and table if provided
      if (req.body.filterByPage) {
        whereClause.pageName = req.body.filterByPage;
      }
      if (req.body.filterByTable) {
        whereClause.tableName = req.body.filterByTable;
      }
      
      const queryParams = new URLSearchParams({
        q: JSON.stringify({
          where: whereClause,
          limit: 1
        })
      });
      const loadUrl = `https://data.plasmic.app/api/v1/cms/databases/${cmsDbId}/tables/${tableId}/query?${queryParams}`;
      console.log('📥 Loading from CMS at:', loadUrl);
      console.log('🔍 Filter criteria:', whereClause);
      
      const response = await fetch(loadUrl, {
        method: 'GET',
        headers: getUserHeaders(false) // Use public token for read operations
      });

      console.log('📡 Load response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Load failed:', response.status, errorText);
        
        // For load operations, 404 is expected when no config exists
        if (response.status === 404) {
          console.log('📭 No saved config found (404 - expected for new configs)');
          return res.status(200).json({ 
            success: true, 
            data: null,
            note: 'No saved configuration found - this is normal for new configurations'
          });
        }
        
        throw new Error(`Load failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const record = result?.rows?.[0];
      
      // Try to get config from published data first, then fall back to draft data
      let config = record?.data?.pivotConfig || record?.draftData?.pivotConfig;

      // If pivotConfig is stored as a string, parse it back to object
      if (typeof config === 'string') {
        try {
          config = JSON.parse(config);
          console.log('📊 Parsed pivotConfig from string:', config);
        } catch (parseError) {
          console.error('❌ Failed to parse pivotConfig string:', parseError);
          config = null;
        }
      }

      console.log('📊 Load result:', { 
        found: !!config, 
        config,
        source: record?.data?.pivotConfig ? 'published' : 'draft'
      });

      // Store to cache and send cacheable response
      setInCache(cacheKey, config || null);
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ 
        success: true, 
        data: config || null 
      });

    } else if (action === 'list') {
      // Try in-memory cache first (60s TTL)
      const cacheKey = `list:${req.body.filterByPage || ''}:${req.body.filterByTable || ''}:${req.body.listBy || ''}`;
      const cached = getFromCache(cacheKey, 60 * 1000);
      if (cached) {
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
        return res.status(200).json({ success: true, data: cached, count: cached.length, cached: true });
      }
      // List configurations filtered by page and/or table
      let whereClause = {};
      
      if (req.body.filterByPage) {
        whereClause.pageName = req.body.filterByPage;
      }
      if (req.body.filterByTable) {
        whereClause.tableName = req.body.filterByTable;
      }
      
      const queryParams = new URLSearchParams({
        q: JSON.stringify({
          where: whereClause,
          limit: 50 // Get up to 50 configurations
        })
      });
      
      const listUrl = `https://data.plasmic.app/api/v1/cms/databases/${cmsDbId}/tables/${tableId}/query?${queryParams}`;
      console.log('📋 Listing configurations from CMS at:', listUrl);
      console.log('🔍 List filter criteria:', whereClause);
      
      const response = await fetch(listUrl, {
        method: 'GET',
        headers: getUserHeaders(false) // Use public token for read operations
      });

      console.log('📡 List response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ List failed:', response.status, errorText);
        throw new Error(`List failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const configs = result?.rows?.map(record => {
        // Try to get config from published data first, then fall back to draft data
        const data = record?.data || record?.draftData;
        let pivotConfig = data?.pivotConfig;

        // If pivotConfig is stored as a string, parse it back to object
        if (typeof pivotConfig === 'string') {
          try {
            pivotConfig = JSON.parse(pivotConfig);
          } catch (parseError) {
            console.error('❌ Failed to parse pivotConfig string for record:', record.id, parseError);
            pivotConfig = null;
          }
        }

        return {
          id: record.id,
          configKey: data?.configKey,
          pageName: data?.pageName,
          tableName: data?.tableName,
          userId: data?.userId,
          userRole: data?.userRole,
          updatedAt: data?.updatedAt,
          pivotConfig,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt
        };
      }) || [];

      console.log('📊 List result:', { found: configs.length, configs: configs.slice(0, 3) }); // Log first 3 for brevity

      // Store to cache and send cacheable response
      setInCache(cacheKey, configs);
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ 
        success: true, 
        data: configs,
        count: configs.length
      });

    } else {
      console.error('❌ Invalid action:', action);
      return res.status(400).json({ error: 'Invalid action. Supported actions: save, load, list' });
    }

  } catch (error) {
    console.error('💥 Plasmic CMS API error:', error);
    console.error('💥 Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'CMS operation failed', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 