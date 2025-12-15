import { useCallback } from 'react';

// Exact pivot configuration functions extracted from PrimeDataTable.js
export const createPivotConfigHandlers = ({
  enablePivotUI,
  localPivotConfig,
  mergedPivotConfig,
  setIsPivotEnabled,
  setShowPivotConfig,
  enablePivotPersistence,
  finalSaveToCMS,
  isAdminUser,
  setIsSavingPivotConfig,
  pivotConfigKey,
  setLocalPivotConfig
}) => {

  // Apply pivot configuration (UI only - temporary) - EXACT CODE FROM PRIMEDATATABLE.JS
  const applyPivotConfig = useCallback(() => {
    if (enablePivotUI) {
      // Update the merged pivot config with local config
      const newConfig = { ...mergedPivotConfig, ...localPivotConfig };
      // console.log('Applying pivot config (UI only):', newConfig);
      setIsPivotEnabled(newConfig.enabled && newConfig.rows.length > 0);
    }
    setShowPivotConfig(false);
  }, [localPivotConfig, mergedPivotConfig, enablePivotUI]);

  // Apply AND Save pivot configuration to CMS - EXACT CODE FROM PRIMEDATATABLE.JS
  const applyAndSavePivotConfig = useCallback(async () => {
    console.log('💾 Starting Apply & Save process:', {
      enablePivotUI,
      enablePivotPersistence,
      hasSaveFunction: !!finalSaveToCMS,
      isAdmin: isAdminUser(),
      pivotConfigKey
    });

    if (enablePivotUI) {
      // First apply to UI
      const newConfig = { ...mergedPivotConfig, ...localPivotConfig };
      console.log('📊 Applying pivot config to UI:', newConfig);
      setIsPivotEnabled(newConfig.enabled && newConfig.rows.length > 0);
      
      // Then save to CMS (only if user is admin)
      if (enablePivotPersistence && finalSaveToCMS && isAdminUser()) {
        try {
          setIsSavingPivotConfig(true);
          console.log('💾 Saving to CMS with config:', localPivotConfig);
          await finalSaveToCMS(pivotConfigKey, localPivotConfig);
          console.log('✅ Apply & Save successful!');
        } catch (error) {
          console.error('❌ CMS SAVE FAILED:', error);
          // Show user-friendly error message
          alert(`Failed to save pivot configuration: ${error.message}\n\nPlease check your permissions or contact your administrator.`);
        } finally {
          setIsSavingPivotConfig(false);
        }
      } else if (enablePivotPersistence && !isAdminUser()) {
        console.warn('🚫 User does not have admin permissions to save to CMS');
        alert('Pivot configuration applied locally but not saved to CMS.\n\nYou need admin permissions to save configurations. Please contact your administrator.');
      } else if (!enablePivotPersistence) {
        console.warn('🚫 CMS persistence is disabled');
        alert('Pivot configuration applied locally but not saved to CMS.\n\nCMS persistence is disabled for this table.');
      } else if (!finalSaveToCMS) {
        console.warn('🚫 No save function available');
        alert('Pivot configuration applied locally but not saved to CMS.\n\nNo save function is configured for this table.');
      }
    }
    setShowPivotConfig(false);
  }, [localPivotConfig, mergedPivotConfig, enablePivotUI, enablePivotPersistence, finalSaveToCMS, pivotConfigKey, isAdminUser]);

  // Reset pivot configuration - EXACT CODE FROM PRIMEDATATABLE.JS
  const resetPivotConfig = useCallback(async () => {
    const defaultConfig = {
      enabled: false,
      rows: [],
      columns: [],
      values: [],
      filters: [],
      showGrandTotals: true,
      showRowTotals: true,
      showColumnTotals: true,
      showSubTotals: true
    };
    
    setLocalPivotConfig(defaultConfig);
    setIsPivotEnabled(false);
    
    // Save reset config to CMS (only if user is admin)
    if (enablePivotPersistence && finalSaveToCMS && isAdminUser()) {
      try {
        setIsSavingPivotConfig(true);
        await finalSaveToCMS(pivotConfigKey, defaultConfig);
        console.log('🔄 RESET CONFIG SAVED TO CMS');
      } catch (error) {
        console.error('❌ FAILED TO SAVE RESET CONFIG:', error);
        alert(`Failed to save reset configuration: ${error.message}`);
      } finally {
        setIsSavingPivotConfig(false);
      }
    } else if (enablePivotPersistence && !isAdminUser()) {
      console.warn('🚫 User does not have admin permissions to save reset config');
      alert('Pivot configuration reset locally but not saved to CMS.\n\nYou need admin permissions to save configurations.');
    }
  }, [enablePivotPersistence, finalSaveToCMS, pivotConfigKey, isAdminUser]);

  // Manual save function for CMS persistence (admin only) - EXACT CODE FROM PRIMEDATATABLE.JS
  const savePivotConfigManually = useCallback(async () => {
    console.log('💾 Starting manual save process:', {
      enablePivotPersistence,
      hasSaveFunction: !!finalSaveToCMS,
      isAdmin: isAdminUser(),
      pivotConfigKey,
      isAdminUserFunction: typeof isAdminUser,
      isAdminUserResult: isAdminUser()
    });

    if (!enablePivotPersistence || !finalSaveToCMS) {
      console.warn('🚫 Manual save not available:', {
        enablePivotPersistence,
        hasSaveFunction: !!finalSaveToCMS
      });
      alert('Manual save is not available for this table.\n\nPlease check your configuration.');
      return;
    }
    
    if (!isAdminUser()) {
      console.warn('🚫 Manual save denied: Only admin users can save pivot configurations');
      console.log('🔍 Manual save admin check details:', {
        isAdminUserFunction: typeof isAdminUser,
        isAdminUserResult: isAdminUser(),
        enablePivotPersistence,
        hasSaveFunction: !!finalSaveToCMS
      });
      alert('Access denied: Only admin users can save pivot configurations.\n\nPlease contact your administrator to get admin permissions.');
      throw new Error('Access denied: Only admin users can save pivot configurations');
    }
    
    setIsSavingPivotConfig(true);
    try {
      console.log('💾 MANUAL SAVE TO CMS - Config Key:', pivotConfigKey);
      console.log('📊 MANUAL SAVE TO CMS - Pivot Config:', localPivotConfig);
      
      await finalSaveToCMS(pivotConfigKey, localPivotConfig);
      
      console.log('✅ MANUAL CMS SAVE SUCCESSFUL!');
      alert('Pivot configuration saved successfully!');
    } catch (error) {
      console.error('❌ MANUAL CMS SAVE FAILED:', error);
      alert(`Failed to save pivot configuration: ${error.message}\n\nPlease check your permissions or contact your administrator.`);
      throw error;
    } finally {
      setIsSavingPivotConfig(false);
    }
  }, [localPivotConfig, enablePivotPersistence, finalSaveToCMS, pivotConfigKey, isAdminUser]);

  return {
    applyPivotConfig,
    applyAndSavePivotConfig,
    resetPivotConfig,
    savePivotConfigManually
  };
};