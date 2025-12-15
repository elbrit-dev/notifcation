import React, { useState, useEffect } from 'react';
import AdvancedSkeleton from '../components/AdvancedSkeleton';
import SimpleButton from '../components/SimpleButton';
import SimpleCard from '../components/SimpleCard';

export default function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  const [forceRender, setForceRender] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleLoading = () => setLoading(!loading);
  const toggleForceRender = () => setForceRender(!forceRender);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1>Advanced Skeleton Component Demo</h1>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <SimpleButton 
          label={loading ? "Stop Loading" : "Start Loading"} 
          onClick={toggleLoading}
          severity={loading ? "danger" : "success"}
          icon={loading ? "pi pi-stop" : "pi pi-play"}
        />
        <SimpleButton 
          label={forceRender ? "Stop Force Render" : "Start Force Render"} 
          onClick={toggleForceRender}
          severity={forceRender ? "warning" : "info"}
          icon={forceRender ? "pi pi-pause" : "pi pi-refresh"}
        />
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2>Basic Skeleton Examples</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <SimpleCard title="Single Line Skeleton">
            <AdvancedSkeleton 
              loading={loading}
              forceRender={forceRender}
            >
              <p>This is the actual content that appears when loading is complete. The skeleton shows while the content is loading.</p>
            </AdvancedSkeleton>
          </SimpleCard>

          <SimpleCard title="Multiple Lines">
            <AdvancedSkeleton 
              loading={loading}
              forceRender={forceRender}
              lines={3}
              template="text"
            >
              <div>
                <h3>Real Content Title</h3>
                <p>This is a paragraph of text that represents the actual content.</p>
                <p>Another paragraph that shows when loading is finished.</p>
              </div>
            </AdvancedSkeleton>
          </SimpleCard>

          <SimpleCard title="Circle Skeleton">
            <AdvancedSkeleton 
              loading={loading}
              forceRender={forceRender}
              shape="circle"
              width="60px"
              height="60px"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src="https://via.placeholder.com/60" 
                  alt="Profile" 
                  style={{ borderRadius: '50%' }}
                />
                <span>User Profile Image</span>
              </div>
            </AdvancedSkeleton>
          </SimpleCard>
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2>Template Examples</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          
          <SimpleCard title="Avatar Template">
            <AdvancedSkeleton 
              loading={loading}
              forceRender={forceRender}
              template="avatar"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src="https://via.placeholder.com/60" 
                  alt="User" 
                  style={{ borderRadius: '50%', width: '60px', height: '60px' }}
                />
                <div>
                  <h4 style={{ margin: 0 }}>John Doe</h4>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>Software Developer</p>
                </div>
              </div>
            </AdvancedSkeleton>
          </SimpleCard>

          <SimpleCard title="List Template">
            <AdvancedSkeleton 
              loading={loading}
              forceRender={forceRender}
              template="list"
              lines={3}
            >
              <div>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: '#007bff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      {i}
                    </div>
                    <div>
                      <div>List Item {i}</div>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>Description for item {i}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AdvancedSkeleton>
          </SimpleCard>

          <SimpleCard title="Card Template">
            <AdvancedSkeleton 
              loading={loading}
              forceRender={forceRender}
              template="card"
            >
              <div>
                <img 
                  src="https://via.placeholder.com/300x200" 
                  alt="Card" 
                  style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '1rem' }}
                />
                <h3>Card Title</h3>
                <p style={{ color: '#666' }}>Card subtitle</p>
                <p>This is the card content that appears when loading is complete.</p>
              </div>
            </AdvancedSkeleton>
          </SimpleCard>
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2>Animation Examples</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          
          <SimpleCard title="Wave Animation">
            <AdvancedSkeleton 
              loading={true}
              animation="wave"
              lines={2}
            >
              <p>Content</p>
            </AdvancedSkeleton>
          </SimpleCard>

          <SimpleCard title="Pulse Animation">
            <AdvancedSkeleton 
              loading={true}
              animation="pulse"
              lines={2}
            >
              <p>Content</p>
            </AdvancedSkeleton>
          </SimpleCard>

          <SimpleCard title="No Animation">
            <AdvancedSkeleton 
              loading={true}
              animation="none"
              lines={2}
            >
              <p>Content</p>
            </AdvancedSkeleton>
          </SimpleCard>
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2>Advanced Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <SimpleCard title="Randomized Dimensions">
            <AdvancedSkeleton 
              loading={loading}
              forceRender={forceRender}
              randomize={true}
              lines={3}
              template="text"
              forceRenderInterval={800}
            >
              <div>
                <p>This skeleton has randomized dimensions that change during force rendering.</p>
                <p>Each line has slightly different widths for a more realistic look.</p>
                <p>Perfect for text content loading states.</p>
              </div>
            </AdvancedSkeleton>
          </SimpleCard>

          <SimpleCard title="Custom Colors">
            <AdvancedSkeleton 
              loading={loading}
              forceRender={forceRender}
              backgroundColor="#e3f2fd"
              highlightColor="#bbdefb"
              lines={2}
            >
              <div>
                <h4>Custom Styled Content</h4>
                <p>This skeleton uses custom colors that match your theme.</p>
              </div>
            </AdvancedSkeleton>
          </SimpleCard>

          <SimpleCard title="Force Render Demo">
            <AdvancedSkeleton 
              loading={false}
              forceRender={true}
              forceRenderDuration={10000}
              autoStopForceRender={true}
              template="avatar"
              onForceRenderStart={() => console.log('Force render started')}
              onForceRenderStop={() => console.log('Force render stopped')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  backgroundColor: '#28a745',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  FR
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>Force Render Demo</h4>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>
                    This shows skeleton even when loading=false
                  </p>
                </div>
              </div>
            </AdvancedSkeleton>
          </SimpleCard>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Real-world Examples</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3>User Profile Card</h3>
          <SimpleCard width="400px">
            <AdvancedSkeleton 
              loading={loading}
              forceRender={forceRender}
              template="avatar"
              fadeIn={true}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <img 
                  src="https://via.placeholder.com/60" 
                  alt="Profile" 
                  style={{ borderRadius: '50%', width: '60px', height: '60px' }}
                />
                <div>
                  <h3 style={{ margin: 0 }}>Jane Smith</h3>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>Product Manager</p>
                </div>
              </div>
              <p>Jane is a seasoned product manager with 8 years of experience in tech startups. She specializes in user experience and growth strategies.</p>
              <SimpleButton label="View Profile" icon="pi pi-user" />
            </AdvancedSkeleton>
          </SimpleCard>
        </div>

        <div>
          <h3>Product Grid</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3].map(i => (
              <SimpleCard key={i}>
                <AdvancedSkeleton 
                  loading={loading}
                  forceRender={forceRender}
                  template="card"
                  fadeIn={true}
                >
                  <div>
                    <img 
                      src={`https://via.placeholder.com/250x150?text=Product ${i}`} 
                      alt={`Product ${i}`} 
                      style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '1rem' }}
                    />
                    <h4>Product {i}</h4>
                    <p style={{ color: '#666', fontSize: '0.875rem' }}>High-quality product description</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${(i * 29).toFixed(2)}</span>
                      <SimpleButton label="Add to Cart" size="small" />
                    </div>
                  </div>
                </AdvancedSkeleton>
              </SimpleCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
