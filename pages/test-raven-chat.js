import React from 'react';
import { RavenChatEmbed } from '../components/RavenChatEmbed';

export default function TestRavenChat() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Raven Chat Embed Test</h1>
      <p>This page tests the new RavenChatEmbed component.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Default Settings</h2>
        <RavenChatEmbed />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Custom Settings</h2>
        <RavenChatEmbed 
          height={600}
          showBorder={true}
          borderRadius={15}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Compact Version</h2>
        <RavenChatEmbed 
          height={400}
          showBorder={true}
          borderRadius={5}
        />
      </div>
    </div>
  );
}
