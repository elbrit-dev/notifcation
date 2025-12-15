# Plasmic Column Grouping Configuration Guide

## Overview

The PrimeDataTable component now supports intelligent auto-column grouping directly in Plasmic Studio. This allows you to create beautiful grouped table headers without writing code.

## Setup in Plasmic Studio

### 1. Enable Column Grouping

In the Plasmic Studio component properties panel:

1. ✅ Check **"Enable Column Grouping"** (enableColumnGrouping)
2. ✅ Check **"Enable Auto Column Grouping"** (enableAutoColumnGrouping)

### 2. Configure Your Data Structure

Your data should follow this pattern for automatic grouping:
```
{
  "drCode": "00000001",
  "drName": "Yuvaraj",
  "salesTeam": "Elbrit Coimbatore",
  "2025-04-01__serviceAmount": 0,
  "2025-04-01__supportValue": 16521,
  "serviceAmount Total": 0,
  "supportValue Total": 16521
}
```

### 3. Basic Configuration Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| **groupSeparator** | String | Character(s) that separate prefix from suffix | `"__"` (default) |
| **ungroupedColumns** | Array | Columns to keep as individual headers | `["drCode", "drName", "salesTeam"]` |
| **totalColumns** | Array | Columns representing totals | `["serviceAmount Total", "supportValue Total"]` |

### 4. Advanced Configuration

#### Custom Group Mappings
For industry-specific terminology:

**Property:** `customGroupMappings`  
**Type:** Object  
**Example:**
```json
{
  "inventory": "Inventory Management",
  "warehouse": "Warehouse Operations",
  "production": "Production",
  "quality": "Quality Control"
}
```

#### Styling Options

**Header Group Style** (`headerGroupStyle`):
```json
{
  "backgroundColor": "#e3f2fd",
  "fontWeight": "bold",
  "textAlign": "center",
  "color": "#1976d2"
}
```

**Sub-header Style** (`groupStyle`):
```json
{
  "backgroundColor": "#f5f5f5",
  "fontSize": "0.9em",
  "textAlign": "center"
}
```

## Step-by-Step Plasmic Configuration

### Step 1: Data Setup
Configure your data source to include:
- **Ungrouped columns:** Basic info like ID, Name, etc.
- **Grouped columns:** Following pattern `prefix__suffix`
- **Total columns:** Ending with "Total" or listed in totalColumns

### Step 2: Basic Grouping
1. Set **enableColumnGrouping** = `true`
2. Set **enableAutoColumnGrouping** = `true`
3. Set **ungroupedColumns** = `["drCode", "drName", "salesTeam"]`
4. Set **groupSeparator** = `"__"`

### Step 3: Handle Totals
Set **totalColumns** = `["serviceAmount Total", "supportValue Total"]`

Total columns will automatically be grouped under their parent groups:
- `serviceAmount Total` → Goes under "Service" group
- `supportValue Total` → Goes under "Support" group

### Step 4: Custom Words (Optional)
If you have custom business terms, set **customGroupMappings**:
```json
{
  "inventory": "Inventory",
  "warehouse": "Warehouse",
  "logistics": "Logistics"
}
```

### Step 5: Styling (Optional)
Customize the appearance with **headerGroupStyle** and **groupStyle**.

## Built-in Word Detection

The component automatically recognizes these keywords:

| Keyword | Group Name |
|---------|------------|
| service | Service |
| support | Support |
| sales | Sales |
| marketing | Marketing |
| revenue | Revenue |
| cost | Cost |
| budget | Budget |
| forecast | Forecast |
| target | Target |
| actual | Actual |
| profit | Profit |
| expense | Expense |

## Result

Your table will automatically display like this:

```
┌─────────┬─────────┬──────────────┬───────────────────┬─────────────────────┐
│ drCode  │ drName  │ salesTeam    │      Service      │       Support       │
│         │         │              ├─────────┬─────────┼─────────┬───────────┤
│         │         │              │ 2025-04 │  Total  │ 2025-04 │   Total   │
├─────────┼─────────┼──────────────┼─────────┼─────────┼─────────┼───────────┤
│00000001 │ Yuvaraj │ Elbrit...    │    0    │    0    │  16521  │   16521   │
└─────────┴─────────┴──────────────┴─────────┴─────────┴─────────┴───────────┘
```

## Common Patterns

### Financial Data
```json
{
  "drCode": "001",
  "Q1__revenueAmount": 15000,
  "Q1__costAmount": 8000,
  "Q2__revenueAmount": 18000,
  "Q2__costAmount": 9000,
  "revenueAmount Total": 33000,
  "costAmount Total": 17000
}
```

### Sales Data
```json
{
  "region": "North",
  "Jan__salesCount": 45,
  "Jan__salesAmount": 15000,
  "Feb__salesCount": 52,
  "Feb__salesAmount": 18000,
  "salesCount Total": 97,
  "salesAmount Total": 33000
}
```

### Inventory Data
```json
{
  "location": "Warehouse A",
  "Q1__inventoryCount": 1500,
  "Q1__inventoryValue": 45000,
  "Q1__warehouseSpace": 250,
  "inventoryCount Total": 1500,
  "warehouseSpace Total": 250
}
```
*Note: For inventory/warehouse, set customGroupMappings:*
```json
{
  "inventory": "Inventory Management",
  "warehouse": "Warehouse Operations"
}
```

## Troubleshooting

### Groups Not Appearing
- ✅ Check that **enableColumnGrouping** and **enableAutoColumnGrouping** are both `true`
- ✅ Verify column names contain the **groupSeparator** (`__` by default)
- ✅ Ensure column names include recognized keywords or add **customGroupMappings**

### Totals in Wrong Place
- ✅ Check **totalColumns** array includes your total column names
- ✅ Verify total column names contain the group keywords (e.g., "serviceAmount Total" contains "service")

### Styling Issues
- ✅ Use JSON format for style objects in Plasmic
- ✅ Check CSS property names are in camelCase (backgroundColor, not background-color)

## Best Practices

1. **Consistent Naming:** Use consistent separators and keywords
2. **Clear Grouping:** Group related data logically
3. **Total Placement:** Name totals to match their parent groups
4. **Custom Mappings:** Use for industry-specific terminology
5. **Styling:** Keep group headers visually distinct but harmonious

This configuration allows you to create sophisticated grouped tables directly in Plasmic Studio without any custom code! 