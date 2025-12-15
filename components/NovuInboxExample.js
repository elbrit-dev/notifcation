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
      
      {/* Example 1: Basic usage - uses employeeId from AuthContext */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Example 1: Basic Usage</h3>
        <p>Automatically uses employeeId from authenticated user</p>
        <NovuInbox />
      </div>

      {/* Example 2: With custom styling */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Example 2: With Custom Styling</h3>
        <NovuInbox 
          className="custom-inbox"
          style={{ 
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000
          }}
        />
      </div>

      {/* Example 3: With explicit subscriber ID */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Example 3: With Explicit Subscriber ID</h3>
        <NovuInbox subscriberId="IN002" />
      </div>

      {/* Example 4: Keyless mode for testing */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Example 4: Keyless Mode (Testing)</h3>
        <p>Shows temporary data, expires in 24h</p>
        <NovuInbox keyless={true} />
      </div>

      {/* Example 5: EU Region */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Example 5: EU Region</h3>
        <NovuInbox 
          backendUrl="https://eu.api.novu.co"
          socketUrl="wss://eu.socket.novu.co"
        />
      </div>

      {/* Example 6: With User Payload */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Example 6: With User Payload</h3>
        <p>Pass user data (firstName, lastName, email, phone, avatar, data) to Novu</p>
        <NovuInbox 
          userPayload={{
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
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

