/**
 * Test script to verify push notifications appear in inbox
 * 
 * This script sends a test notification and verifies it appears in both:
 * 1. Browser/system push notification
 * 2. Novu Inbox
 * 
 * Usage: Copy and paste into browser console on your live site
 */

(async function testPushInInbox() {
  const testData = {
    subscriberId: 'IN003',
    title: 'Test: Push in Inbox',
    body: 'This notification should appear as both a push notification AND in the inbox!',
    payload: {
      testId: Date.now(),
      url: '/test',
      message: 'If you see this in both places, the setup is correct!'
    }
  };

  try {
    console.log('🧪 Testing push notification in inbox...');
    console.log('📋 Test data:', testData);
    
    // Send notification
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Notification sent successfully!');
      console.log('📋 Response:', result);
      
      console.log('\n📝 What to check:');
      console.log('1. ✅ Push notification should appear as browser/system notification');
      console.log('2. ✅ Same notification should appear in Novu Inbox widget');
      console.log('3. ✅ Both should show:');
      console.log('   - Title: "Test: Push in Inbox"');
      console.log('   - Body: "This notification should appear as both..."');
      
      console.log('\n🔍 If push notification appears but NOT in inbox:');
      console.log('   → Your workflow is missing In-App channel');
      console.log('   → Go to Novu Dashboard → Workflows → Add In-App channel');
      
      console.log('\n🔍 If notification appears in inbox but NO push notification:');
      console.log('   → Your workflow is missing Push channel');
      console.log('   → Go to Novu Dashboard → Workflows → Add Push channel (OneSignal)');
      
      console.log('\n🔍 If neither appears:');
      console.log('   → Check subscriber exists in Novu');
      console.log('   → Check OneSignal credentials are set');
      console.log('   → Check browser notification permission');
      
    } else {
      console.error('❌ Failed to send notification:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();

