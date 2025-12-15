import { useCallback } from 'react';

// CMS Integration Hook
export const usePlasmicCMS = (workspaceId, tableId, apiToken, user) => {
  
  // Helper function to check if user has admin permissions
  const isAdminUser = useCallback(() => {
    const ADMIN_ROLE_ID = '6c2a85c7-116e-43b3-a4ff-db11b7858487';
    
    // Check multiple possible role properties
    const userRole = user?.role || user?.roleId;
    const userRoleIds = user?.roleIds || [];
    
    // Check if user has admin role in any of the possible locations
    const hasAdminRole = userRole === ADMIN_ROLE_ID || 
                        userRoleIds.includes(ADMIN_ROLE_ID) ||
                        (user?.roleName === 'Admin' && user?.roleId === ADMIN_ROLE_ID);
    
    console.log('🔍 Checking admin permissions:', {
      userRole,
      userRoleIds,
      userRoleName: user?.roleName,
      userRoleId: user?.roleId,
      ADMIN_ROLE_ID,
      hasAdminRole,
      user: user ? { 
        email: user.email, 
        role: user.role, 
        roleId: user.roleId,
        roleIds: user.roleIds,
        roleName: user.roleName
      } : null
    });
    
    return hasAdminRole;
  }, [user]);
  
  // Helper function to parse page and table names from configKey
  const parseConfigKey = useCallback((configKey) => {
    const parts = configKey.split('_');
    return {
      pageName: parts[0] || 'defaultPage',
      tableName: parts[1] || 'defaultTable'
    };
  }, []);
  
  const saveToCMS = useCallback(async (configKey, pivotConfig) => {
    console.log('💾 Starting CMS save process:', {
      configKey,
      pivotConfig,
      workspaceId,
      tableId,
      hasApiToken: !!apiToken,
      user: user ? { 
        email: user.email, 
        role: user.role, 
        roleId: user.roleId,
        roleIds: user.roleIds,
        roleName: user.roleName
      } : null
    });

    if (!workspaceId) {
      console.warn('❌ Plasmic workspace ID not provided for CMS integration');
      throw new Error('Plasmic workspace ID not provided for CMS integration');
    }

    // Check if user has admin permissions
    if (!isAdminUser()) {
      console.warn('🚫 User does not have admin permissions to save configurations');
      console.log('🔍 Admin check details:', {
        userRole: user?.role || user?.roleId,
        userRoleIds: user?.roleIds,
        userRoleName: user?.roleName,
        requiredRole: '6c2a85c7-116e-43b3-a4ff-db11b7858487',
        user: user ? { 
          email: user.email, 
          role: user.role, 
          roleId: user.roleId,
          roleIds: user.roleIds,
          roleName: user.roleName
        } : null
      });
      throw new Error('Access denied: Only admin users can save pivot configurations. Please contact your administrator to get admin permissions.');
    }

    // Parse page and table names from configKey
    const { pageName, tableName } = parseConfigKey(configKey);

    // Always use secure API route to avoid CORS issues and improve security
    try {
      console.log('📡 Sending save request to API:', {
        action: 'save',
        configKey,
        pageName,
        tableName,
        userId: user?.email || null,
        userRole: user?.role || user?.roleId || null,
        userRoleIds: user?.roleIds || null,
        userRoleName: user?.roleName || null
      });

      const response = await fetch('/api/plasmic-cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          configKey,
          pivotConfig,
          pageName,
          tableName,
          userId: user?.email || null,
          userRole: user?.role || user?.roleId || null,
          userRoleIds: user?.roleIds || null,
          userRoleName: user?.roleName || null
        })
      });

      console.log('📡 API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API save failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        if (response.status === 403) {
          throw new Error(errorData.message || 'Access denied: Only admin users can save pivot configurations');
        }
        
        if (response.status === 500) {
          throw new Error(`CMS configuration error: ${errorData.details || errorData.error || 'Unknown server error'}`);
        }
        
        throw new Error(`API route failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ CMS save successful:', result);
      return result.data;
    } catch (error) {
      console.error('❌ CMS SAVE FAILED (API route):', error);
      throw error;
    }
  }, [workspaceId, user, isAdminUser, parseConfigKey]);
  
  const loadFromCMS = useCallback(async (configKey, filterByPage = null, filterByTable = null) => {
    if (!workspaceId) {
      console.warn('Plasmic workspace ID not provided for CMS integration');
      return null;
    }

    // Always use secure API route to avoid CORS issues and improve security
    try {
      const response = await fetch('/api/plasmic-cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'load',
          configKey,
          filterByPage,
          filterByTable
        })
      });

      if (!response.ok) {
        throw new Error(`API route failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.data) {
        return result.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ CMS LOAD FAILED (API route):', error);
      return null;
    }
  }, [workspaceId]);
  
  const listConfigurationsFromCMS = useCallback(async (filterByPage = null, filterByTable = null) => {
    if (!workspaceId) {
      console.warn('Plasmic workspace ID not provided for CMS integration');
      return [];
    }

    // Always use secure API route to avoid CORS issues and improve security
    try {
      const response = await fetch('/api/plasmic-cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'list',
          filterByPage,
          filterByTable
        })
      });

      if (!response.ok) {
        throw new Error(`API route failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('❌ CMS LIST FAILED (API route):', error);
      throw error;
    }
  }, [workspaceId]);

  return { saveToCMS, loadFromCMS, listConfigurationsFromCMS, isAdminUser };
};

// Built-in default save function for local storage fallback
export const defaultSaveToCMS = async (configKey, config) => {
  try {
    // Save to localStorage as fallback
    const storageKey = `pivotConfig_${configKey}`;
    localStorage.setItem(storageKey, JSON.stringify(config));
    console.log('✅ Pivot config saved to localStorage:', storageKey, config);
    return true;
  } catch (error) {
    console.error('❌ Failed to save pivot config:', error);
    return false;
  }
};

export const defaultLoadFromCMS = async (configKey) => {
  try {
    // Load from localStorage as fallback
    const storageKey = `pivotConfig_${configKey}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const config = JSON.parse(stored);
      console.log('✅ Pivot config loaded from localStorage:', storageKey, config);
      return config;
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to load pivot config:', error);
    return null;
  }
};