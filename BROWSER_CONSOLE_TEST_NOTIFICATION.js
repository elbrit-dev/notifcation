/**
 * Browser Console Script to Test Notification Send
 * 
 * This will help debug the 500 error by showing detailed error information
 */

(async function() {
  console.log('🧪 Testing Notification Send');
  console.log('============================\n');

  const testData = {
    subscriberId: 'IN003',
    title: 'Test Push Notification',
    body: 'This is a test to verify push notifications are working',
    workflowId: 'default' // Try 'default' or 'announcement' based on your workflow
  };

  console.log('📤 Sending notification with data:', testData);
  console.log('');

  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();

    console.log('📡 Response Status:', response.status);
    console.log('📊 Response Data:', data);
    console.log('');

    if (response.ok) {
      console.log('✅ SUCCESS! Notification sent');
      console.log('   Transaction ID:', data.transactionId);
      console.log('');
      console.log('💡 Check Novu Dashboard → Activity Feed for execution details');
    } else {
      console.error('❌ FAILED to send notification');
      console.error('   Error:', data.error);
      console.error('   Details:', data.details);
      console.error('   Message:', data.message);
      console.error('   Workflow ID:', data.workflowId);
      console.error('   Subscriber ID:', data.subscriberId);
      console.log('');
      console.log('🔍 Common Issues:');
      console.log('   1. Workflow not found - Check workflow identifier');
      console.log('   2. Subscriber not found - Verify IN003 exists in Novu');
      console.log('   3. NOVU_SECRET_KEY not set - Check environment variables');
      console.log('   4. Invalid API key - Verify Novu secret key');
      console.log('   5. Network error - Check server logs');
      console.log('');
      console.log('💡 Next Steps:');
      console.log('   1. Check server logs (Netlify Functions logs)');
      console.log('   2. Verify workflow exists: "default" or "announcement"');
      console.log('   3. Check NOVU_SECRET_KEY in Netlify environment variables');
      console.log('   4. Try with different workflowId (e.g., "announcement")');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   - Check if site is accessible');
    console.log('   - Check browser console for CORS errors');
    console.log('   - Verify API endpoint exists: /api/notifications/send');
  }
})();

