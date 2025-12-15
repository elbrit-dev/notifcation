# ERPNext Authentication Setup Guide

## Overview
This guide helps you set up ERPNext authentication to replace Plasmic auth. The system now uses ERPNext for role-based access control while keeping Firebase for authentication (Microsoft SSO and Phone).

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# ERPNext Configuration (REQUIRED)
ERP_NEXT_URL=https://your-erpnext-instance.com
ERP_NEXT_API_KEY=your_api_key_here
ERP_NEXT_API_SECRET=your_api_secret_here

# Firebase Configuration (Already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Azure Configuration (for Microsoft SSO)
NEXT_PUBLIC_AZURE_TENANT_ID=your_azure_tenant_id
```

## ERPNext API Setup

### 1. Generate API Key and Secret
1. Log into your ERPNext instance
2. Go to **Setup > Users and Permissions > API Access**
3. Click **New** to create a new API key
4. Set appropriate permissions (read access to Employee and User tables)
5. Copy the **API Key** and **API Secret**

### 2. Required ERPNext Data Structure

The system primarily uses the **Employee table** for both authentication providers:

**Employee Table Fields (Primary):**
- `name` (Employee ID)
- `first_name` (Employee Name)
- `cell_number` (Phone Number)
- `fsl_whatsapp_number` (WhatsApp Number)
- `user_id__name` (User Email)
- `company_email` (Company Email) ← **Key field for role access**

**Note:** Only users in the Employee table are allowed access. The User table is not used for authentication.

## Authentication Flow

### Microsoft SSO Flow:
1. User clicks Microsoft login
2. Firebase authenticates with Azure AD → gets user's email
3. ERPNext API searches Employee table by `company_email = user's email`
4. Returns employee data with admin role (same fields as phone auth)
5. User is authenticated with ERPNext employee data

### Phone Authentication Flow:
1. User enters phone number
2. Firebase sends SMS verification
3. User enters verification code
4. ERPNext API searches Employee table by phone number to get company_email
5. ERPNext API searches Employee table by `company_email = found company_email`
6. Returns employee data with admin role
7. User is authenticated with ERPNext employee data

### Unified Data Structure:
Both authentication providers return the same employee data fields:
- `first_name`: Employee name
- `fsl_whatsapp_number`: WhatsApp number
- `cell_number`: Phone number
- `user_id__name`: User email
- `company_email`: Company email (key field for role access)

## Access Control

**Only users found in ERPNext Employee table are allowed access:**

- ✅ **Users in ERPNext**: Get admin role and full access
- ❌ **Users not in ERPNext**: Access denied with error message
- 🔒 **Security**: No default user creation for unauthorized users

**Error Handling:**
- If user not found in ERPNext → Returns 403 Access Denied
- Shows user-friendly error message: "Access Denied: You are not authorized to access this system"
- Logs detailed error information for administrators

## Testing the Setup

1. **Test Microsoft SSO:**
   - Try logging in with a Microsoft account
   - Check browser console for ERPNext API calls
   - Verify user data is loaded from ERPNext

2. **Test Phone Authentication:**
   - Try logging in with a phone number
   - Check browser console for ERPNext API calls
   - Verify employee data is loaded from ERPNext

## Troubleshooting

### ERPNext API Errors
- Check API key and secret are correct
- Verify ERPNext URL is accessible
- Ensure API key has proper permissions

### Authentication Issues
- Check Firebase configuration
- Verify Azure tenant ID for Microsoft SSO
- Check browser console for detailed error messages

### Data Not Found
- Verify employee/user exists in ERPNext
- Check field names match expected structure
- Ensure phone numbers are in correct format

## Migration from Plasmic Auth

The system automatically:
- Replaces Plasmic auth calls with ERPNext
- Updates localStorage keys from `plasmic*` to `erpnext*`
- Maintains the same user experience
- Preserves existing Firebase authentication

## Next Steps

1. **Configure ERPNext environment variables**
2. **Test both authentication providers**
3. **Customize role assignment logic**
4. **Add additional ERPNext data fields as needed** 