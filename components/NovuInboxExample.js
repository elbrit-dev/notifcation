import React from 'react';
import NovuInbox from './NovuInbox';

/**
 * Example usage of NovuInbox component
 * 
 * This demonstrates different ways to use the NovuInbox component
 */
function NovuInboxExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>NovuInbox Examples</h2>
      
     
      {/* Example 6: With User Payload */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Example 6: With User Payload</h3>
        <p>Pass user data (firstName, lastName, email, phone, avatar, data) to Novu</p>
        <NovuInbox 
          userPayload={{
            firstName: 'Mounika',
            lastName: 'M',
            email: 'mounika@elbrit.org',
            phone: '+919345405242',
            avatar: 'https://example.com/avatar.jpg',
            data: {
              department: 'Engineering',
              role: 'Developer'
            }
          }}
        />
      </div>
    </div>
  );
}

export default NovuInboxExample;

