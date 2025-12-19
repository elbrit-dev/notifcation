# Tabs with Static Notification Counts - Setup Summary

## 📋 What You Need to Provide

### **1. Static Notification Counts**

You need to provide **3 numbers** for the notification counts:

```javascript
{
  all: 10,        // Total number of all notifications
  primary: 5,     // Number of primary notifications
  secondary: 5    // Number of secondary notifications
}
```

### **2. How to Tag Notifications (For Filtering)**

To make notifications appear in the correct tabs, you need to tag them. Choose **ONE** method:

#### **Option A: Using Tags in Novu Workflow** (Recommended)
- Go to Novu Dashboard → Workflows
- Edit your workflow
- Add tags: `"primary"` or `"secondary"` to the workflow
- Save the workflow

#### **Option B: Using Data Payload** (When Sending Notifications)
When sending notifications, include `priority` in the payload:

```javascript
// Primary notification
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',
    title: 'Important Update',
    body: 'This is a primary notification',
    payload: {
      priority: 'primary'  // This makes it appear in Primary tab
    }
  })
});

// Secondary notification
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriberId: 'IN003',
    title: 'General Update',
    body: 'This is a secondary notification',
    payload: {
      priority: 'secondary'  // This makes it appear in Secondary tab
    }
  })
});
```

---

## 🎯 **Implementation Options**

### **Option 1: Pass Static Counts as Props** (Simplest)

Add a new prop to `NovuInbox` component:

```javascript
<NovuInbox
  applicationIdentifier="sCfOsfXhHZNc"
  subscriberId="IN003"
  staticCounts={{
    all: 10,
    primary: 5,
    secondary: 5
  }}
/>
```

**What you need to provide:**
- `staticCounts.all` - Total count (number)
- `staticCounts.primary` - Primary count (number)
- `staticCounts.secondary` - Secondary count (number)

---

### **Option 2: Hardcode Static Counts in Component**

Set fixed counts directly in the component code:

```javascript
const staticCounts = {
  all: 10,
  primary: 5,
  secondary: 5
};
```

**What you need to provide:**
- Just tell me the 3 numbers you want

---

### **Option 3: Fetch from API (Dynamic)**

Use the existing `/api/notifications/counts` endpoint to fetch real counts.

**What you need to provide:**
- Nothing (counts are fetched automatically)
- But you need to ensure notifications are properly tagged

---

## 📝 **Summary Checklist**

### **For Static Counts Setup, You Need:**

1. ✅ **Three Numbers:**
   - Total notifications count (all)
   - Primary notifications count
   - Secondary notifications count

2. ✅ **Notification Tagging Method:**
   - Choose: Workflow tags OR payload data
   - If using payload: Include `priority: 'primary'` or `priority: 'secondary'` when sending

3. ✅ **Component Configuration:**
   - Application Identifier: `sCfOsfXhHZNc` (already set)
   - Subscriber ID: `IN003` (already set)
   - Static counts: **You provide the 3 numbers**

---

## 🔧 **What I Will Implement**

Once you provide the static counts, I will:

1. ✅ Add tabs configuration (All/Primary/Secondary)
2. ✅ Add static counts display in tab labels
3. ✅ Add filter logic for Primary/Secondary tabs
4. ✅ Ensure proper hook ordering (fix React errors)
5. ✅ Make it SSR-safe

---

## 📊 **Example Usage**

### **If you choose Option 1 (Props):**

```javascript
// In your page/component
<NovuInbox
  applicationIdentifier="sCfOsfXhHZNc"
  subscriberId="IN003"
  staticCounts={{
    all: 15,      // You provide this
    primary: 8,   // You provide this
    secondary: 7  // You provide this
  }}
/>
```

### **If you choose Option 2 (Hardcoded):**

Just tell me:
- "Set all: 15, primary: 8, secondary: 7"

---

## ❓ **Questions for You**

1. **What are your static counts?**
   - All: ?
   - Primary: ?
   - Secondary: ?

2. **How do you want to provide them?**
   - As props (Option 1)
   - Hardcoded in component (Option 2)
   - Fetch from API (Option 3)

3. **How are you tagging notifications?**
   - Workflow tags in Novu Dashboard
   - Payload data (`priority: 'primary'` or `priority: 'secondary'`)

---

## 🎨 **Result**

After implementation, you'll see:

```
[All Notifications (15)] [Primary (8)] [Secondary (7)]
```

Where:
- **All Notifications (15)** - Shows all notifications, no filter
- **Primary (8)** - Shows only notifications tagged as "primary"
- **Secondary (7)** - Shows only notifications tagged as "secondary"

---

## ⚠️ **Important Notes**

1. **Counts are static** - They won't update automatically unless you:
   - Pass new props (Option 1)
   - Update hardcoded values (Option 2)
   - Use API fetching (Option 3)

2. **Filtering works** - Tabs will filter notifications based on:
   - Workflow tags: `['primary']` or `['secondary']`
   - OR payload data: `{ priority: 'primary' }` or `{ priority: 'secondary' }`

3. **Tagging is required** - Notifications must be tagged to appear in Primary/Secondary tabs

---

**Please provide:**
1. The 3 static count numbers
2. Your preferred option (1, 2, or 3)
3. How you're tagging notifications (workflow tags or payload data)

