/**
 * Test script to verify notifications appear in Novu Inbox
 * 
 * Copy and paste this into your browser console on your live site
 */

(async function testInboxDisplay() {
  console.log('🧪 Testing Novu Inbox Display...');
  
  // Get current subscriber ID
  const employeeId = localStorage.getItem('employeeId') || 'IN003';
  console.log('📋 Using Subscriber ID:', employeeId);
  
  // Send a test notification
  console.log('\n📤 Sending test notification...');
  const sendResponse = await fetch('/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscriberId: employeeId,
      title: 'Test: Inbox Display',
      body: 'This notification should appear in the Novu Inbox widget! Check the inbox to see if it shows up.',
      payload: {
        testId: Date.now(),
        url: '/test',
        message: 'If you see this in the inbox, it\'s working!'
      }
    })
  });

  const sendResult = await sendResponse.json();
  
  if (sendResponse.ok) {
    console.log('✅ Notification sent successfully!');
    console.log('📋 Response:', sendResult);
    
    console.log('\n📝 What to check now:');
    console.log('1. ✅ Push notification should appear as browser/system notification');
    console.log('2. ✅ Same notification should appear in Novu Inbox widget');
    console.log('3. ✅ Inbox should show:');
    console.log('   - Title: "Test: Inbox Display"');
    console.log('   - Body: "This notification should appear in the Novu Inbox widget!..."');
    console.log('   - Timestamp (e.g., "Just now")');
    console.log('   - Unread badge/indicator');
    
    console.log('\n🔍 If notification appears as push but NOT in inbox:');
    console.log('   → Your Novu workflow is missing In-App channel');
    console.log('   → Go to: https://web.novu.co/workflows');
    console.log('   → Edit your workflow → Add In-App channel');
    console.log('   → Configure: Title = {{title}}, Content = {{body}}');
    
    console.log('\n🔍 If inbox shows "Quiet for now" or is empty:');
    console.log('   → Check subscriber ID matches:', employeeId);
    console.log('   → Verify subscriber exists in Novu dashboard');
    console.log('   → Check browser console for 400 errors');
    console.log('   → Make sure workflow has In-App channel configured');
    
    console.log('\n✅ If you see the notification in the inbox widget, everything is working!');
    
  } else {
    console.error('❌ Failed to send notification:', sendResult);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Check NOVU_SECRET_KEY is set');
    console.log('   - Verify workflow exists in Novu');
    console.log('   - Check subscriber exists:', employeeId);
  }
})();

