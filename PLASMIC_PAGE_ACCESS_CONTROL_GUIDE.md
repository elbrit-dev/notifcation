# Plasmic Page-Level Access Control Guide

## Overview
Now that we've disabled Plasmic's built-in authentication, you can use the custom user data (including roles from ERPNext) to implement page-level access control within Plasmic Studio.

## Available User Data
The following user data is available in Plasmic Studio through the `currentUser` data provider:

- `email`: User's email address
- `uid`: Firebase user ID
- `isAuthenticated`: Boolean indicating if user is logged in
- `displayName`: User's display name
- `role`: User's role from ERPNext (e.g., "admin", "user", "manager")
- `roleName`: User's role name from ERPNext
- `roleNames`: Array of role names
- `customProperties`: Any additional custom properties

## How to Implement Page-Level Access Control

### Method 1: Using Plasmic Studio's Built-in Visibility Settings

1. **Open Plasmic Studio** and navigate to your project
2. **Select a page** you want to protect
3. **In the right panel**, find the **"Visibility"** section
4. **Set visibility to "Conditional"**
5. **Use the following expressions** based on your needs:

#### Admin-Only Pages
```
currentUser.role === "admin"
```

#### Multiple Role Access
```
currentUser.role === "admin" || currentUser.role === "manager"
```

#### Authenticated Users Only
```
currentUser.isAuthenticated === true
```

#### Specific Role Names
```
currentUser.roleName === "Administrator"
```

### Method 2: Using Data Queries for Complex Logic

1. **Create a new Data Query** in Plasmic Studio
2. **Name it** something like "userAccessControl"
3. **Use this query**:
```javascript
// In Plasmic Studio Data Query
const user = currentUser;

// Define access rules
const accessRules = {
  "admin-dashboard": user.role === "admin",
  "user-dashboard": user.isAuthenticated,
  "manager-reports": user.role === "admin" || user.role === "manager",
  "public-pages": true
};

// Return access control data
return {
  canAccessAdminDashboard: accessRules["admin-dashboard"],
  canAccessUserDashboard: accessRules["user-dashboard"],
  canAccessManagerReports: accessRules["manager-reports"],
  canAccessPublicPages: accessRules["public-pages"],
  userRole: user.role,
  isAuthenticated: user.isAuthenticated
};
```

4. **Use the query results** in page visibility conditions:
```
userAccessControl.canAccessAdminDashboard === true
```

### Method 3: Component-Level Access Control

You can also control access at the component level:

1. **Select a component** within a page
2. **Set its visibility** to conditional
3. **Use expressions** like:
```
currentUser.role === "admin" && currentUser.isAuthenticated
```

## Example Page Structure

### Admin Dashboard Page
- **Visibility**: `currentUser.role === "admin"`
- **Components**: Admin-specific charts, user management, system settings

### User Dashboard Page
- **Visibility**: `currentUser.isAuthenticated`
- **Components**: User profile, basic reports, personal data

### Manager Reports Page
- **Visibility**: `currentUser.role === "admin" || currentUser.role === "manager"`
- **Components**: Team reports, performance metrics, advanced analytics

### Public Pages
- **Visibility**: `true` (always visible)
- **Components**: Login, registration, public information

## Testing Your Access Control

1. **Use the test page** we created (`/test-auth`) to verify your user data
2. **Check the browser console** for `window.PLASMIC_DATA` to see available data
3. **Test with different user roles** from ERPNext

## Troubleshooting

### Page Still Shows "Access Denied"
1. **Check Plasmic Studio settings** - ensure authentication is set to "Disabled"
2. **Verify data provider** - make sure `currentUser` is properly configured
3. **Check browser console** - look for any JavaScript errors

### User Data Not Available
1. **Verify AuthContext** - ensure user is properly authenticated
2. **Check PlasmicDataContext** - confirm data is being set to `window.PLASMIC_DATA`
3. **Test the API** - verify ERPNext integration is working

### Role-Based Access Not Working
1. **Check role values** - verify the exact role strings from ERPNext
2. **Use exact matching** - `currentUser.role === "admin"` (case-sensitive)
3. **Test with console.log** - add debugging in your data queries

## Advanced Access Control Patterns

### Role Hierarchy
```javascript
// In a data query
const userRole = currentUser.role;
const roleHierarchy = {
  "admin": 3,
  "manager": 2,
  "user": 1
};

const userLevel = roleHierarchy[userRole] || 0;
const requiredLevel = 2; // Manager or higher

return {
  hasAccess: userLevel >= requiredLevel,
  userLevel: userLevel
};
```

### Time-Based Access
```javascript
// In a data query
const now = new Date();
const hour = now.getHours();
const isBusinessHours = hour >= 9 && hour <= 17;

return {
  canAccessDuringBusinessHours: currentUser.role === "admin" || isBusinessHours
};
```

### Custom Property Access
```javascript
// In a data query
const customProps = currentUser.customProperties;
const department = customProps.department;

return {
  canAccessFinance: currentUser.role === "admin" || department === "finance",
  canAccessHR: currentUser.role === "admin" || department === "hr"
};
```

## Best Practices

1. **Use consistent role names** - match exactly with ERPNext role names
2. **Test thoroughly** - verify access with different user roles
3. **Provide fallbacks** - always have a default page for unauthorized users
4. **Log access attempts** - consider adding logging for security
5. **Keep it simple** - start with basic role checks before adding complexity

## Next Steps

1. **Configure your pages** in Plasmic Studio using the visibility settings
2. **Test with different users** to ensure access control works correctly
3. **Add more complex logic** as needed using data queries
4. **Monitor and adjust** based on user feedback and requirements 