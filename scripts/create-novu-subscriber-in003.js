/**
 * Script to create/update Novu subscriber with specific values
 * Run with: node scripts/create-novu-subscriber-in003.js
 */

const subscriberData = {
  subscriberId: 'IN003',
  email: 'mounika@elbrit.org',
  displayName: 'mounika M',
  oneSignalSubscriptionId: 'efcf8968-c284-4624-8bf9-5856cf2b304d',
  externalId: 'mounika@elbrit.org',
  oneSignalId: 'be812f1b-391a-4e77-9275-cd7276088e40'
};

// Get site URL from environment or use default
const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function createNovuSubscriber() {
  try {
    console.log('📝 Creating/updating Novu subscriber with data:', subscriberData);
    console.log('🌐 Using API endpoint:', `${SITE_URL}/api/novu/create-subscriber`);

    const response = await fetch(`${SITE_URL}/api/novu/create-subscriber`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Subscriber created/updated successfully!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Failed to create/update subscriber');
      console.error('📊 Error response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error calling API:', error.message);
    process.exit(1);
  }
}

createNovuSubscriber();

