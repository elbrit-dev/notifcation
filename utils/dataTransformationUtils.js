/**
 * Data Transformation Utilities for Nested Expandable Tables
 * 
 * This utility helps transform flat data structures into nested hierarchical
 * structures suitable for expandable tables with multiple levels.
 */

/**
 * Transform flat customer data into nested structure for expandable tables
 * 
 * @param {Array} customerData - Flat customer data array
 * @param {Array} invoiceData - Flat invoice data array  
 * @param {Array} brandData - Flat brand data array
 * @returns {Array} Nested data structure
 */
export const transformToNestedStructure = (customerData, invoiceData, brandData) => {
  // Create a map for quick lookup
  const customerMap = new Map();
  const invoiceMap = new Map();
  
  // Initialize customer structure
  customerData.forEach(customer => {
    customerMap.set(customer.EBSCode, {
      ...customer,
      invoices: []
    });
  });
  
  // Group invoices by customer
  invoiceData.forEach(invoice => {
    const customer = customerMap.get(invoice.EBSCode);
    if (customer) {
      // Find matching brands for this invoice
      const invoiceBrands = brandData.filter(brand => 
        brand.HQ === invoice.HQ && 
        brand.Incentive === invoice.Incentive && 
        brand.CreditNote === invoice.CreditNote
      );
      
      const invoiceWithBrands = {
        ...invoice,
        brands: invoiceBrands
      };
      
      customer.invoices.push(invoiceWithBrands);
    }
  });
  
  // Convert map to array and filter out customers with no invoices
  return Array.from(customerMap.values())
    .filter(customer => customer.invoices.length > 0);
};

/**
 * Transform flat data with common fields into nested structure
 * 
 * @param {Array} data - Flat data array
 * @param {string} groupByField - Field to group by (e.g., 'Customer', 'EBSCode')
 * @param {string} nestedField - Field name for nested data (e.g., 'invoices', 'brands')
 * @param {Array} nestedData - Data to nest under each group
 * @param {Function} matchFunction - Function to match nested data with parent
 * @returns {Array} Nested data structure
 */
export const transformToGenericNestedStructure = (
  data, 
  groupByField, 
  nestedField, 
  nestedData, 
  matchFunction
) => {
  const groupedMap = new Map();
  
  // Group main data
  data.forEach(item => {
    const key = item[groupByField];
    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        ...item,
        [nestedField]: []
      });
    }
  });
  
  // Add nested data
  nestedData.forEach(nestedItem => {
    for (const [key, groupedItem] of groupedMap) {
      if (matchFunction(groupedItem, nestedItem)) {
        groupedItem[nestedField].push(nestedItem);
        break;
      }
    }
  });
  
  return Array.from(groupedMap.values());
};

/**
 * Create customer-invoice-brand hierarchy from your specific data structure
 * 
 * @param {Array} customerData - Your customer data
 * @param {Array} invoiceData - Your invoice data
 * @param {Array} brandData - Your brand data
 * @returns {Array} Nested hierarchy
 */
export const createCustomerInvoiceBrandHierarchy = (customerData, invoiceData, brandData) => {
  // Step 1: Group invoices by customer (using EBSCode as key)
  const customerInvoiceMap = new Map();
  
  customerData.forEach(customer => {
    customerInvoiceMap.set(customer.EBSCode, {
      ...customer,
      invoices: []
    });
  });
  
  // Step 2: Add invoices to customers
  invoiceData.forEach(invoice => {
    const customer = customerInvoiceMap.get(invoice.EBSCode);
    if (customer) {
      // Step 3: Find matching brands for this invoice
      const matchingBrands = brandData.filter(brand => {
        // Match by HQ and financial values
        return brand.HQ === invoice.HQ && 
               brand.Incentive === invoice.Incentive && 
               brand.CreditNote === invoice.CreditNote;
      });
      
      const invoiceWithBrands = {
        ...invoice,
        brands: matchingBrands
      };
      
      customer.invoices.push(invoiceWithBrands);
    }
  });
  
  // Step 4: Return only customers with invoices
  return Array.from(customerInvoiceMap.values())
    .filter(customer => customer.invoices.length > 0);
};

/**
 * Alternative: Create hierarchy using customer name as key
 * 
 * @param {Array} customerData - Your customer data
 * @param {Array} invoiceData - Your invoice data
 * @param {Array} brandData - Your brand data
 * @returns {Array} Nested hierarchy
 */
export const createCustomerInvoiceBrandHierarchyByName = (customerData, invoiceData, brandData) => {
  const customerInvoiceMap = new Map();
  
  customerData.forEach(customer => {
    customerInvoiceMap.set(customer.Customer, {
      ...customer,
      invoices: []
    });
  });
  
  invoiceData.forEach(invoice => {
    const customer = customerInvoiceMap.get(invoice.Customer);
    if (customer) {
      const matchingBrands = brandData.filter(brand => {
        return brand.HQ === invoice.HQ && 
               brand.Incentive === invoice.Incentive && 
               brand.CreditNote === invoice.CreditNote;
      });
      
      const invoiceWithBrands = {
        ...invoice,
        brands: matchingBrands
      };
      
      customer.invoices.push(invoiceWithBrands);
    }
  });
  
  return Array.from(customerInvoiceMap.values())
    .filter(customer => customer.invoices.length > 0);
};

/**
 * Example usage function
 */
export const exampleUsage = () => {
  // Your data
  const customerData = [
    {
      "Customer": "AADITYA PHARMEX",
      "EBSCode": "EBS042",
      "HQ": "Chennai",
      "Incentive": 2000,
      "CreditNote": -500
    }
  ];
  
  const invoiceData = [
    {
      "Invoice": "INV-25-10451",
      "PostingDate": "2025-07-05",
      "Customer": "AADITYA PHARMEX",
      "EBSCode": "EBS042",
      "HQ": "HQ-Madurai",
      "Incentive": 1200,
      "CreditNote": 0
    }
  ];
  
  const brandData = [
    {
      "Brand": "PAINFREE",
      "HQ": "HQ-Madurai",
      "Incentive": 1200,
      "CreditNote": 0
    }
  ];
  
  // Transform to nested structure
  const nestedData = createCustomerInvoiceBrandHierarchy(customerData, invoiceData, brandData);
  
  console.log('Nested Data:', nestedData);
  return nestedData;
};

export default {
  transformToNestedStructure,
  transformToGenericNestedStructure,
  createCustomerInvoiceBrandHierarchy,
  createCustomerInvoiceBrandHierarchyByName,
  exampleUsage
};
