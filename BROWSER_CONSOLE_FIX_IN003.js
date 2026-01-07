/**
 * Browser Console Script to Fix IN003 Subscriber
 * 
 * Copy and paste this into your browser console on your live site
 * This will update IN003 with the correct data
 */

(async function() {
  const subscriberData = {
    subscriberId: 'IN003',
    email: 'mounika@elbrit.org',
    displayName: 'mounika M',
    oneSignalSubscriptionId: 'efcf8968-c284-4624-8bf9-5856cf2b304d',
    externalId: 'mounika@elbrit.org',
    oneSignalId: 'be812f1b-391a-4e77-9275-cd7276088e40'
  };

  console.log('🔧 Fixing IN003 subscriber...');
  console.log('📋 Data to send:', subscriberData);
  console.log('\n');

  try {
    const response = await fetch('/api/novu/create-subscriber', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData)
    });

    const data = await response.json();

    console.log('📡 Response status:', response.status);
    console.log('📊 Response data:', data);
    console.log('\n');

    if (response.ok) {
      console.log('✅ SUCCESS! Subscriber updated.');
      console.log('\n');
      console.log('🔍 Verification:');
      console.log('   - Subscriber ID:', data.subscriber?.subscriberId);
      console.log('   - Email:', data.subscriber?.email);
      console.log('   - First Name:', data.subscriber?.firstName);
      console.log('   - Last Name:', data.subscriber?.lastName);
      console.log('   - OneSignal ID:', data.subscriber?.oneSignalId);
      console.log('\n');
      console.log('💡 Next steps:');
      console.log('   1. Refresh the Novu dashboard');
      console.log('   2. Click on "IN003" subscriber');
      console.log('   3. Check that email shows: mounika@elbrit.org');
      console.log('   4. Check that First Name shows: mounika');
      console.log('   5. Check that Last Name shows: M');
      console.log('   6. Check Custom data (JSON) shows:');
      console.log('      {');
      console.log('        "externalId": "mounika@elbrit.org",');
      console.log('        "oneSignalId": "be812f1b-391a-4e77-9275-cd7276088e40"');
      console.log('      }');
      console.log('   7. Go to "Subscriptions" tab');
      console.log('   8. Verify device token is: be812f1b-391a-4e77-9275-cd7276088e40');
    } else {
      console.error('❌ FAILED to update subscriber');
      console.error('📊 Error details:', data);
      console.log('\n');
      console.log('💡 Troubleshooting:');
      console.log('   - Check browser Network tab for full error');
      console.log('   - Check server logs for detailed error message');
      console.log('   - Verify NOVU_SECRET_KEY is set in environment variables');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('\n');
    console.log('💡 Troubleshooting:');
    console.log('   - Check if the site is accessible');
    console.log('   - Check browser console for CORS errors');
    console.log('   - Verify the API endpoint exists: /api/novu/create-subscriber');
  }
})();

