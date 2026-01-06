/**
 * Script to manually create a Novu subscriber
 * 
 * Usage: 
 *   - In browser console on your live site, copy and paste the code below
 *   - Or set SITE_URL environment variable: SITE_URL=https://your-site.netlify.app node scripts/create-novu-subscriber.js
 * 
 * This script creates a Novu subscriber with the provided details
 */

// Configure your live site URL here
const SITE_URL = process.env.SITE_URL || 'https://notifiy-test.netlify.app';

const subscriberData = {
  subscriberId: 'IN003', // Employee ID
  email: 'mounika@elbrit.org',
  displayName: 'mounika M',
  oneSignalSubscriptionId: 'efcf8968-c284-4624-8bf9-5856cf2b304d', // Subscription ID
  externalId: 'mounika@elbrit.org',
  oneSignalId: 'be812f1b-391a-4e77-9275-cd7276088e40'
};

async function createSubscriber() {
  try {
    const apiUrl = `${SITE_URL}/api/novu/create-subscriber`;
    console.log('🚀 Creating Novu subscriber with data:', subscriberData);
    console.log('🌐 API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Subscriber created successfully!');
      console.log('📋 Result:', JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Failed to create subscriber:', result);
      if (typeof process !== 'undefined') process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (typeof process !== 'undefined') process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  createSubscriber();
}

module.exports = { createSubscriber, subscriberData };

