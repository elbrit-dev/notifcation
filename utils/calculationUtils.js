import { useCallback } from 'react';

// ROI Calculation Functions
export const useROICalculation = (enableROICalculation, roiConfig) => {
  const calculateROI = useCallback((rowData) => {
    if (!enableROICalculation || !roiConfig) return null;

    const { 
      revenueField, 
      costField, 
      investmentField, 
      profitField, 
      calculationMethod,
      customROICalculation 
    } = roiConfig;

    // Use custom calculation if provided
    if (customROICalculation && typeof customROICalculation === 'function') {
      return customROICalculation(rowData);
    }

    // Get values from row data
    const revenue = parseFloat(rowData[revenueField]) || 0;
    const cost = parseFloat(rowData[costField]) || 0;
    const investment = parseFloat(rowData[investmentField]) || 0;
    const profit = parseFloat(rowData[profitField]) || 0;

    // Prevent division by zero
    if (investment === 0) return 0;

    let roiValue = 0;

    if (calculationMethod === 'profit') {
      // ROI = (Profit / Investment) * 100
      roiValue = (profit / investment) * 100;
    } else {
      // Standard: ROI = ((Revenue - Cost) / Investment) * 100
      roiValue = ((revenue - cost) / investment) * 100;
    }

    return roiValue;
  }, [enableROICalculation, roiConfig]);

  const getROIColor = useCallback((roiValue) => {
    if (!roiConfig?.enableROIColorCoding) return null;

    const { roiColorThresholds, positiveROIThreshold, negativeROIThreshold } = roiConfig;

    if (roiValue >= positiveROIThreshold) {
      return roiColorThresholds.positive;
    } else if (roiValue < negativeROIThreshold) {
      return roiColorThresholds.negative;
    } else {
      return roiColorThresholds.neutral;
    }
  }, [roiConfig]);

  const formatROIValue = useCallback((roiValue) => {
    if (roiValue === null || roiValue === undefined) return 'N/A';

    const { roiNumberFormat, roiPrecision, showROIAsPercentage } = roiConfig;

    if (showROIAsPercentage) {
      return new Intl.NumberFormat(roiNumberFormat, {
        minimumFractionDigits: roiPrecision,
        maximumFractionDigits: roiPrecision
      }).format(roiValue) + '%';
    } else {
      return new Intl.NumberFormat(roiNumberFormat, {
        minimumFractionDigits: roiPrecision,
        maximumFractionDigits: roiPrecision
      }).format(roiValue);
    }
  }, [roiConfig]);

  return { calculateROI, getROIColor, formatROIValue };
};

// Footer Totals Calculation
export const calculateFooterTotals = (data, footerTotalsConfig) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { totals: {}, averages: {}, counts: {} };
  }

  const totals = {};
  const averages = {};
  const counts = {};

  // Get all numeric columns from the data
  const sampleRow = data.find(row => row && typeof row === 'object');
  if (!sampleRow) {
    return { totals: {}, averages: {}, counts: {} };
  }

  const numericColumns = Object.keys(sampleRow).filter(key => {
    // Check if any value in this column is numeric
    return data.some(row => {
      const value = row[key];
      return typeof value === 'number' && !isNaN(value);
    });
  });

  numericColumns.forEach(column => {
    const values = data
      .map(row => row[column])
      .filter(value => typeof value === 'number' && !isNaN(value));

    if (values.length > 0) {
      // Calculate totals
      if (footerTotalsConfig.showTotals) {
        totals[column] = values.reduce((sum, value) => sum + value, 0);
      }

      // Calculate averages
      if (footerTotalsConfig.showAverages) {
        averages[column] = values.reduce((sum, value) => sum + value, 0) / values.length;
      }

      // Calculate counts
      if (footerTotalsConfig.showCounts) {
        counts[column] = values.length;
      }
    }
  });

  return { totals, averages, counts };
};

// Format number for footer totals
export const formatFooterNumber = (value, column, currencyColumns, footerTotalsConfig) => {
  if (typeof value !== 'number') return '';

  const currency = footerTotalsConfig.currency || 'USD';
  const numberFormat = footerTotalsConfig.numberFormat || 'en-US';
  const precision = footerTotalsConfig.precision || 2;

  try {
    if (currencyColumns.includes(column.key) && currency) {
      return new Intl.NumberFormat(numberFormat, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
      }).format(value);
    }

    return new Intl.NumberFormat(numberFormat, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(value);
  } catch (error) {
    console.warn('Footer formatting error:', error, { currency, numberFormat, precision });
    // Fallback to simple formatting
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
};

// Check if column is numeric for footer totals
export const isNumericColumn = (column, currencyColumns, tableData) => {
  // Check if column type is explicitly set to 'number'
  if (column.type === 'number') return true;
  
  // Check if column key is in currencyColumns
  if (currencyColumns.includes(column.key)) return true;
  
  // Check if column key contains numeric indicators
  if (column.key && typeof column.key === 'string') {
    const key = column.key.toLowerCase();
    if (key.includes('amount') || 
        key.includes('total') || 
        key.includes('sum') ||
        key.includes('revenue') ||
        key.includes('cost') ||
        key.includes('profit') ||
        key.includes('price') ||
        key.includes('value') ||
        key.includes('service') ||
        key.includes('emi') ||
        key.includes('cheque')) {
      return true;
    }
  }
  
  // Check if column data contains numeric values
  if (Array.isArray(tableData) && tableData.length > 0) {
    const sampleValues = tableData.slice(0, 10).map(row => row[column.key]);
    const hasNumericValues = sampleValues.some(val => 
      typeof val === 'number' && !isNaN(val)
    );
    if (hasNumericValues) return true;
  }
  
  return false;
};