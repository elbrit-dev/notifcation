/**
 * Browser Console Script to Create Novu Subscriber
 * 
 * Copy and paste this entire script into your browser console on your live site
 * (e.g., https://your-site.netlify.app)
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

  try {
    console.log('📝 Creating/updating Novu subscriber with data:', subscriberData);
    
    const response = await fetch('/api/novu/create-subscriber', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Subscriber created/updated successfully!');
      console.log('📊 Response:', data);
    } else {
      console.error('❌ Failed to create/update subscriber');
      console.error('📊 Error response:', data);
    }
  } catch (error) {
    console.error('❌ Error calling API:', error.message);
  }
})();

