# 📬 Postman Testing Guide for Elbrit Auth

## 🚀 Quick Start

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop `Elbrit_Auth_Testing.postman_collection.json`
4. Collection will appear in your sidebar

### Step 2: Test the Endpoints

## 📋 Available Tests

### ✅ Test 1: Auth - Valid Email (Microsoft SSO)
**Endpoint:** `POST https://app.elbrit.org/api/erpnext/auth`

**Request Body:**
```json
{
  "email": "user@elbrit.org",
  "authProvider": "microsoft"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "uid": "EMP-XXXX",
    "email": "user@elbrit.org",
    "phoneNumber": "9876543210",
    "displayName": "John Doe",
    "role": "admin",
    "roleName": "Admin",
    "kly_role_id": "ROLE-123",
    "authProvider": "microsoft",
    "customProperties": {
      "organization": "Elbrit Life Sciences",
      "accessLevel": "full",
      "provider": "microsoft",
      "employeeId": "EMP-XXXX"
    },
    "employeeData": {
      "name": "EMP-XXXX",
      "first_name": "John",
      "company_email": "user@elbrit.org",
      "cell_number": "9876543210",
      "status": "Active"
    }
  },
  "token": "RU1QLVhYWFg6MTczMjQzNTY3ODkwMA==",
  "userSource": "employee"
}
```

---

### ✅ Test 2: Auth - Valid Phone Number
**Endpoint:** `POST https://app.elbrit.org/api/erpnext/auth`

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "authProvider": "phone"
}
```

**Expected Response (200 OK):**
Same structure as Test 1

---

### ❌ Test 3: Invalid Email (Should Fail)
**Request Body:**
```json
{
  "email": "nonexistent@example.com",
  "authProvider": "microsoft"
}
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "Access Denied",
  "message": "User not found in organization. Please contact your administrator.",
  "details": {
    "searchedEmail": "nonexistent@example.com",
    "authProvider": "microsoft",
    "userSource": "not_found"
  }
}
```

---

### ❌ Test 4: Missing Fields (Should Fail)
**Request Body:**
```json
{
  "authProvider": "microsoft"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Email or phone number is required"
}
```

---

### ❌ Test 5: Wrong HTTP Method (Should Fail)
**Method:** `GET` (instead of POST)

**Expected Response (405 Method Not Allowed):**
```json
{
  "error": "Method not allowed"
}
```

---

## 🔍 What the API Does

### Flow for **Microsoft SSO Users**:
1. Receives `email` + `authProvider: "microsoft"`
2. Searches ERPNext **Employee** table by `company_email`
3. Verifies employee status is `Active`
4. Returns user data with role and permissions

### Flow for **Phone Auth Users**:
1. Receives `phoneNumber` + `authProvider: "phone"`
2. Cleans phone number (removes +91 country code)
3. Searches ERPNext **Employee** table by `cell_number`
4. Gets `company_email` from employee record
5. Searches again by `company_email` for full user data
6. Verifies employee status is `Active`
7. Returns user data with role and permissions

---

## 📊 Response Codes

| Code | Meaning | Reason |
|------|---------|--------|
| 200 | Success | User authenticated successfully |
| 400 | Bad Request | Missing email or phone number |
| 403 | Forbidden | User not found or inactive in ERPNext |
| 405 | Method Not Allowed | Used GET instead of POST |
| 500 | Server Error | ERPNext connection issue or server error |

---

## 🧪 Testing Real Users

To test with real data from your ERPNext:

1. **Get a real employee email or phone from ERPNext**
2. **Make sure the employee has:**
   - ✅ `status` = "Active"
   - ✅ `company_email` field filled
   - ✅ `cell_number` field filled (for phone auth)

3. **Use their data in Postman:**

**For email:**
```json
{
  "email": "real.user@elbrit.org",
  "authProvider": "microsoft"
}
```

**For phone:**
```json
{
  "phoneNumber": "+919876543210",
  "authProvider": "phone"
}
```

---

## 🔐 Security Notes

- ⚠️ This endpoint does **NOT** require Firebase authentication - it's for ERPNext validation only
- ⚠️ In production, you should add rate limiting to prevent brute force attacks
- ⚠️ The endpoint checks if user exists in ERPNext Employee table
- ⚠️ Only users with `status: "Active"` can authenticate

---

## 🐛 Troubleshooting

### Issue: "ERPNext configuration missing"
**Solution:** Check environment variables on server:
- `ERPNEXT_URL`
- `ERPNEXT_API_KEY`
- `ERPNEXT_API_SECRET`

### Issue: "User not found in organization"
**Solution:** 
- Verify user exists in ERPNext Employee table
- Check `company_email` field is filled
- Check `status` is "Active"

### Issue: "Employee account is not active"
**Solution:**
- Go to ERPNext
- Open Employee record
- Change status to "Active"

---

## 📝 Notes

- Phone numbers are automatically cleaned (removes +91)
- API searches ERPNext **Employee table only** (not User table)
- Token returned is base64 encoded: `employeeId:timestamp`
- `kly_role_id` field is used for role-based access control

---

## 🎯 Next Steps

After successful auth test in Postman, the frontend flow is:

1. User logs in via Firebase (Phone OTP or Microsoft SSO)
2. Frontend calls `/api/erpnext/auth` with email/phone
3. Gets user data + token from ERPNext
4. Stores in localStorage + AuthContext
5. User can access protected pages based on role

---

## 📞 Support

If tests fail, check:
1. ✅ ERPNext is accessible
2. ✅ API credentials are valid
3. ✅ Employee exists in ERPNext
4. ✅ Employee status is "Active"
5. ✅ `company_email` field is filled

