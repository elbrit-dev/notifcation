/**
 * Copy and paste this code into your browser console on your live site
 * to create a Novu subscriber
 * 
 * Instructions:
 * 1. Open your live site (e.g., https://notifiy-test.netlify.app)
 * 2. Open browser console (F12 or Right-click > Inspect > Console)
 * 3. Copy and paste this entire code block
 * 4. Press Enter to execute
 */

(async function createNovuSubscriber() {
  const subscriberData = {
    subscriberId: 'IN003', // Employee ID
    email: 'mounika@elbrit.org',
    displayName: 'mounika M',
    oneSignalSubscriptionId: '85eacb69-525c-41c5-8c24-1d59a64e7b90', // Subscription ID
    externalId: 'mounika@elbrit.org',
    oneSignalId: 'c4ec3fc2-e56c-45e4-a0b5-80de63a2e6d5'
  };

  try {
    console.log('🚀 Creating Novu subscriber with data:', subscriberData);
    
    const response = await fetch('/api/novu/create-subscriber', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Subscriber created successfully!');
      console.log('📋 Result:', result);
      
      // Test sending a notification
      console.log('\n🧪 Testing notification...');
      const testResponse = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId: 'IN003',
          title: 'Welcome!',
          body: 'Your Novu subscriber has been created successfully!'
        })
      });
      
      const testResult = await testResponse.json();
      if (testResponse.ok) {
        console.log('✅ Test notification sent!', testResult);
      } else {
        console.error('❌ Test notification failed:', testResult);
      }
    } else {
      console.error('❌ Failed to create subscriber:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();

