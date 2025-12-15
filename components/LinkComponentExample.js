import React from 'react';
import LinkComponent from './LinkComponent';

/**
 * Example usage of LinkComponent for instant navigation
 * 
 * This demonstrates how to use LinkComponent to navigate between pages
 * without page refreshes, just like in normal React SPAs.
 */
const LinkComponentExample = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>LinkComponent Navigation Examples</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Internal Navigation (Instant - No Refresh)</h3>
        <p>These links will navigate instantly without page refreshes:</p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <LinkComponent 
            href="/" 
            className="nav-link"
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Home Page
          </LinkComponent>
          
          <LinkComponent 
            href="/plasmic-host" 
            className="nav-link"
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Plasmic Host
          </LinkComponent>
          
          <LinkComponent 
            href="/link-test" 
            className="nav-link"
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: 'black',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Link Test
          </LinkComponent>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>External Links (Will Refresh)</h3>
        <p>These external links will cause page refreshes:</p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <LinkComponent 
            href="https://google.com" 
            target="_blank"
            className="external-link"
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Google (External)
          </LinkComponent>
          
          <LinkComponent 
            href="https://github.com" 
            target="_blank"
            className="external-link"
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            GitHub (External)
          </LinkComponent>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Advanced Navigation Options</h3>
        <p>Examples with different navigation behaviors:</p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <LinkComponent 
            href="/" 
            replace={true}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Replace Navigation
          </LinkComponent>
          
          <LinkComponent 
            href="/" 
            scroll={false}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6f42c1',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            No Scroll to Top
          </LinkComponent>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <h4>Key Features:</h4>
        <ul>
          <li><strong>Instant Navigation:</strong> Internal links navigate instantly without page refreshes</li>
          <li><strong>External Link Handling:</strong> External links use regular anchor tags</li>
          <li><strong>Prefetching:</strong> Pages are prefetched for faster navigation</li>
          <li><strong>Flexible Props:</strong> Supports all Next.js Link props</li>
          <li><strong>Replace Navigation:</strong> Use <code>replace={true}</code> to replace current history entry</li>
          <li><strong>Scroll Control:</strong> Use <code>scroll={false}</code> to prevent scrolling to top</li>
        </ul>
      </div>
    </div>
  );
};

export default LinkComponentExample; 