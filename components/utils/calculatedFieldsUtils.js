// Calculated Fields Utilities - Power BI Style Formula Engine
// Handles formula parsing, validation, and execution for pivot table calculated fields

/**
 * Parse a formula to extract field references and validate syntax
 * @param {string} formula - The formula string to parse
 * @param {Array} availableFields - Array of available field objects
 * @returns {Object} - Parsed formula information
 */
export const parseFormula = (formula, availableFields = []) => {
  const result = {
    originalFormula: formula,
    dependencies: [],
    functions: [],
    operators: [],
    constants: [],
    fieldReferences: [],
    isValid: false,
    errors: []
  };

  if (!formula || typeof formula !== 'string') {
    result.errors.push('Formula is required and must be a string');
    return result;
  }

  try {
    // Extract field references [fieldName]
    const fieldPattern = /\[([^\]]+)\]/g;
    let match;
    const fieldRefs = [];
    
    while ((match = fieldPattern.exec(formula)) !== null) {
      const fieldName = match[1];
      fieldRefs.push(fieldName);
      result.fieldReferences.push({
        name: fieldName,
        reference: match[0],
        position: match.index
      });
    }

    result.dependencies = [...new Set(fieldRefs)];

    // Extract mathematical functions
    const functionPattern = /(ABS|ROUND|FLOOR|CEIL|MAX|MIN|AVG|IF|SUM|COUNT)\s*\(/gi;
    const functions = [];
    let funcMatch;
    
    while ((funcMatch = functionPattern.exec(formula)) !== null) {
      functions.push(funcMatch[1].toUpperCase());
    }
    
    result.functions = [...new Set(functions)];

    // Extract operators
    const operatorPattern = /[\+\-\*\/\(\)\>\<\=\!\&\|]/g;
    const operators = [];
    let opMatch;
    
    while ((opMatch = operatorPattern.exec(formula)) !== null) {
      operators.push(opMatch[0]);
    }
    
    result.operators = [...new Set(operators)];

    // Extract numeric constants
    const numberPattern = /\b\d+(?:\.\d+)?\b/g;
    const constants = [];
    let numMatch;
    
    while ((numMatch = numberPattern.exec(formula)) !== null) {
      constants.push(parseFloat(numMatch[0]));
    }
    
    result.constants = constants;

    result.isValid = true;
  } catch (error) {
    result.errors.push(`Parsing error: ${error.message}`);
  }

  return result;
};

/**
 * Validate a formula against available fields and syntax rules
 * @param {string} formula - The formula to validate
 * @param {Array} availableFields - Array of available field objects
 * @returns {Object} - Validation result
 */
export const validateFormula = (formula, availableFields = []) => {
  const validation = {
    isValid: false,
    errors: [],
    warnings: [],
    dependencies: []
  };

  if (!formula || typeof formula !== 'string') {
    validation.errors.push('Formula is required');
    return validation;
  }

  const parsed = parseFormula(formula, availableFields);
  
  if (parsed.errors.length > 0) {
    validation.errors.push(...parsed.errors);
    return validation;
  }

  // Check if all field references exist in available fields
  const availableFieldKeys = availableFields.map(f => f.key || f.field || f.name);
  
  for (const dependency of parsed.dependencies) {
    if (!availableFieldKeys.includes(dependency)) {
      validation.errors.push(`Field '${dependency}' is not available`);
    }
  }

  // Check for balanced parentheses
  const openParens = (formula.match(/\(/g) || []).length;
  const closeParens = (formula.match(/\)/g) || []).length;
  
  if (openParens !== closeParens) {
    validation.errors.push('Unbalanced parentheses in formula');
  }

  // Check for basic syntax issues
  if (formula.includes('//') || formula.includes('**')) {
    validation.errors.push('Invalid operator sequence detected');
  }

  // Check for empty field references
  if (formula.includes('[]')) {
    validation.errors.push('Empty field reference found');
  }

  // Validate IF function syntax (basic check)
  const ifMatches = formula.match(/IF\s*\([^)]+\)/gi);
  if (ifMatches) {
    for (const ifMatch of ifMatches) {
      const inside = ifMatch.replace(/IF\s*\(/, '').replace(/\)$/, '');
      const commas = (inside.match(/,/g) || []).length;
      if (commas !== 2) {
        validation.errors.push('IF function requires exactly 3 parameters: IF(condition, trueValue, falseValue)');
      }
    }
  }

  // Check for division by zero risks
  if (formula.includes('/') && !formula.includes('IF(')) {
    validation.warnings.push('Consider using IF() to prevent division by zero');
  }

  validation.dependencies = parsed.dependencies;
  validation.isValid = validation.errors.length === 0;

  return validation;
};

/**
 * Execute a calculated field formula for a given row of data
 * @param {string} formula - The formula to execute
 * @param {Object} rowData - The data row containing field values
 * @param {Array} availableFields - Array of available field definitions
 * @param {Object} fieldMapping - Optional mapping of field names to actual keys
 * @returns {number|string|null} - The calculated result
 */
export const executeCalculatedField = (formula, rowData, availableFields = [], fieldMapping = {}) => {
  if (!formula || !rowData) {
    return null;
  }

  try {
    // Create a safe execution context
    const context = createExecutionContext(rowData, availableFields);
    
    // Replace field references with actual values
    let executableFormula = formula;
    
    // Replace field references [fieldName] with context values
    const fieldPattern = /\[([^\]]+)\]/g;
    executableFormula = executableFormula.replace(fieldPattern, (match, fieldName) => {
      // First try to find the field using the mapping
      const mappedKey = fieldMapping[fieldName];
      if (mappedKey && context[mappedKey] !== undefined) {
        return context[mappedKey];
      }
      
      // Fallback to direct field name lookup
      const value = context[fieldName];
      return value !== undefined ? value : 0;
    });

    // Replace mathematical functions with JavaScript equivalents
    executableFormula = replaceMathFunctions(executableFormula);



    // Use Function constructor for safe evaluation (instead of eval)
    const safeEval = new Function('context', `
      with(context) {
        return ${executableFormula};
      }
    `);

    const result = safeEval(context);
    
    // Handle edge cases
    if (isNaN(result)) return 0;
    if (!isFinite(result)) return 0;
    
    return result;
  } catch (error) {
    console.error('Formula execution error:', error);
    throw new Error(`Calculation error: ${error.message}`);
  }
};

/**
 * Create execution context with safe mathematical functions
 * @param {Object} rowData - The data row
 * @param {Array} availableFields - Available field definitions
 * @returns {Object} - Execution context
 */
const createExecutionContext = (rowData, availableFields) => {
  const context = { ...rowData };
  
  // Add safe mathematical functions
  context.ABS = Math.abs;
  context.ROUND = Math.round;
  context.FLOOR = Math.floor;
  context.CEIL = Math.ceil;
  context.MAX = Math.max;
  context.MIN = Math.min;
  context.SQRT = Math.sqrt;
  context.POW = Math.pow;
  
  // Custom functions
  context.AVG = (...values) => {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  };
  
  context.SUM = (...values) => {
    return values.filter(v => typeof v === 'number' && !isNaN(v)).reduce((a, b) => a + b, 0);
  };
  
  context.COUNT = (...values) => {
    return values.filter(v => v !== null && v !== undefined).length;
  };
  
  // IF function
  context.IF = (condition, trueValue, falseValue) => {
    return condition ? trueValue : falseValue;
  };

  return context;
};

/**
 * Replace custom math functions with JavaScript equivalents
 * @param {string} formula - Formula string
 * @returns {string} - Formula with replaced functions
 */
const replaceMathFunctions = (formula) => {
  let result = formula;
  
  // Handle IF function specially - convert to ternary operator
  result = result.replace(/IF\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi, '($1) ? ($2) : ($3)');
  
  return result;
};

/**
 * Format calculated field value based on format type
 * @param {number} value - The value to format
 * @param {string} format - Format type (number, percentage, currency, etc.)
 * @param {Object} options - Additional formatting options
 * @returns {string} - Formatted value
 */
export const formatCalculatedValue = (value, format = 'number', options = {}) => {
  if (value === null || value === undefined || isNaN(value)) {
    return value;
  }

  const {
    currency = 'USD',
    locale = 'en-US',
    precision = 2
  } = options;

  switch (format) {
    case 'percentage':
      return `${(value * 100).toFixed(precision)}%`;
      
    case 'currency':
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(value);
      
    case 'decimal2':
      return parseFloat(value).toFixed(2);
      
    case 'decimal4':
      return parseFloat(value).toFixed(4);
      
    case 'integer':
      return Math.round(value).toString();
      
    case 'scientific':
      return value.toExponential(precision);
      
    default:
      // ✅ Force 2 decimal places for calculated fields in default case
      return typeof value === 'number' ? value.toFixed(2) : value.toString();
  }
};

/**
 * Get all field dependencies from multiple calculated fields
 * @param {Array} calculatedFields - Array of calculated field objects
 * @param {Array} availableFields - Available field definitions
 * @returns {Array} - Array of unique dependencies
 */
export const getAllDependencies = (calculatedFields, availableFields) => {
  const allDependencies = new Set();
  
  calculatedFields.forEach(calcField => {
    const validation = validateFormula(calcField.formula, availableFields);
    validation.dependencies.forEach(dep => allDependencies.add(dep));
  });
  
  return Array.from(allDependencies);
};

/**
 * Check for circular dependencies in calculated fields
 * @param {Array} calculatedFields - Array of calculated field objects
 * @returns {Object} - Result of circular dependency check
 */
export const checkCircularDependencies = (calculatedFields) => {
  const result = {
    hasCircularDependency: false,
    circularFields: [],
    dependencyChain: []
  };

  const visited = new Set();
  const recursionStack = new Set();

  const hasCircularDep = (fieldName, dependencyMap) => {
    visited.add(fieldName);
    recursionStack.add(fieldName);

    const dependencies = dependencyMap[fieldName] || [];
    
    for (const dep of dependencies) {
      if (!visited.has(dep)) {
        if (hasCircularDep(dep, dependencyMap)) {
          return true;
        }
      } else if (recursionStack.has(dep)) {
        result.circularFields.push(fieldName);
        return true;
      }
    }

    recursionStack.delete(fieldName);
    return false;
  };

  // Build dependency map
  const dependencyMap = {};
  calculatedFields.forEach(field => {
    const parsed = parseFormula(field.formula);
    dependencyMap[field.name] = parsed.dependencies.filter(dep => 
      calculatedFields.some(cf => cf.name === dep)
    );
  });

  // Check each calculated field for circular dependencies
  for (const field of calculatedFields) {
    if (!visited.has(field.name)) {
      if (hasCircularDep(field.name, dependencyMap)) {
        result.hasCircularDependency = true;
      }
    }
  }

  return result;
};

/**
 * Generate sample formula templates for common business calculations
 * @returns {Array} - Array of formula templates
 */
export const getFormulaTemplates = () => {
  return [
    {
      name: 'ROI (Return on Investment)',
      formula: '([Revenue_sum] - [Cost_sum]) / [Cost_sum] * 100',
      description: 'Calculate return on investment as a percentage',
      category: 'Financial'
    },
    {
      name: 'Profit Margin',
      formula: '([Revenue_sum] - [Cost_sum]) / [Revenue_sum] * 100',
      description: 'Calculate profit margin as a percentage',
      category: 'Financial'
    },
    {
      name: 'Growth Rate',
      formula: '([Current_sum] - [Previous_sum]) / [Previous_sum] * 100',
      description: 'Calculate growth rate between two periods',
      category: 'Financial'
    },
    {
      name: 'Average Per Unit',
      formula: '[Total_sum] / [Quantity_sum]',
      description: 'Calculate average value per unit',
      category: 'Operations'
    },
    {
      name: 'Variance',
      formula: '[Actual_sum] - [Budget_sum]',
      description: 'Calculate variance between actual and budget',
      category: 'Financial'
    },
    {
      name: 'Variance Percentage',
      formula: '([Actual_sum] - [Budget_sum]) / [Budget_sum] * 100',
      description: 'Calculate variance as a percentage of budget',
      category: 'Financial'
    },
    {
      name: 'Conditional Value',
      formula: 'IF([Sales_sum] > 1000, [Sales_sum] * 0.1, 0)',
      description: 'Apply conditional logic to calculations',
      category: 'Logic'
    },
    {
      name: 'Risk Ratio',
      formula: '[Risk_sum] / ([Risk_sum] + [Safe_sum]) * 100',
      description: 'Calculate risk as percentage of total',
      category: 'Analysis'
    }
  ];
};

export default {
  parseFormula,
  validateFormula,
  executeCalculatedField,
  formatCalculatedValue,
  getAllDependencies,
  checkCircularDependencies,
  getFormulaTemplates
};