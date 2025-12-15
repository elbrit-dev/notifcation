'use client';

import React, { useState } from 'react';
import TagFilterPrimeReact from '../components/TagFilterPrimeReact';
import TagFilterAntd from '../components/TagFilterAntd';

const TagFilterExample = () => {
  const [primeReactSelection, setPrimeReactSelection] = useState([]);
  const [antdSelection, setAntdSelection] = useState([]);
  
  // Sample tag data
  const sampleTags = ['React', 'Next.js', 'Plasmic', 'PrimeReact', 'Ant Design', 'TypeScript', 'JavaScript', 'CSS', 'HTML'];
  
  // Sample CMS data structure
  const sampleCMSData = {
    categories: {
      items: [
        { name: 'Frontend', count: 15 },
        { name: 'Backend', count: 8 },
        { name: 'Database', count: 12 },
        { name: 'DevOps', count: 6 }
      ]
    }
  };
  
  const handlePrimeReactChange = (selected, clicked) => {
    console.log('PrimeReact selection changed:', { selected, clicked });
    setPrimeReactSelection(selected);
  };
  
  const handleAntdChange = (selected, clicked) => {
    console.log('Ant Design selection changed:', { selected, clicked });
    setAntdSelection(selected);
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Tag Filter Components Demo</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>PrimeReact Tag Filter</h2>
        <p>Selected: {primeReactSelection.join(', ') || 'None'}</p>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Tag Display Mode</h3>
          <TagFilterPrimeReact
            tagList={sampleTags}
            display="tag"
            multiSelect={true}
            allowDeselect={true}
            maxSelections={5}
            onSelectionChange={handlePrimeReactChange}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Chip Display Mode</h3>
          <TagFilterPrimeReact
            tagList={sampleTags}
            display="chip"
            multiSelect={true}
            allowDeselect={true}
            maxSelections={3}
            onSelectionChange={handlePrimeReactChange}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Button Display Mode</h3>
          <TagFilterPrimeReact
            tagList={sampleTags}
            display="button"
            size="small"
            severity="info"
            multiSelect={false}
            onSelectionChange={handlePrimeReactChange}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Badge Display Mode</h3>
          <TagFilterPrimeReact
            tagList={sampleTags}
            display="badge"
            severity="success"
            multiSelect={true}
            maxSelections={4}
            onSelectionChange={handlePrimeReactChange}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Search Functionality Demo</h3>
          <p>Try searching for tags using the search bar above</p>
          <TagFilterPrimeReact
            tagList={sampleTags}
            showSearch={true}
            searchPlaceholder="Search for tags..."
            multiSelect={true}
            maxSelections={8}
            onSelectionChange={handlePrimeReactChange}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Color Schemes Demo</h3>
          <p>Different color schemes for automatic tag coloring</p>
          
          <div style={{ marginBottom: '16px' }}>
            <h4>Default Color Scheme (Soft Professional)</h4>
            <TagFilterPrimeReact
              tagList={sampleTags.slice(0, 6)}
              enableTagColors={true}
              colorScheme="default"
              multiSelect={true}
              maxSelections={6}
              onSelectionChange={handlePrimeReactChange}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <h4>Rainbow Color Scheme (Vibrant)</h4>
            <TagFilterPrimeReact
              tagList={sampleTags.slice(6, 12)}
              enableTagColors={true}
              colorScheme="rainbow"
              multiSelect={true}
              maxSelections={6}
              onSelectionChange={handlePrimeReactChange}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <h4>Pastel Color Scheme (Soft & Gentle)</h4>
            <TagFilterPrimeReact
              tagList={sampleTags.slice(12, 18)}
              enableTagColors={true}
              colorScheme="pastel"
              multiSelect={true}
              maxSelections={6}
              onSelectionChange={handlePrimeReactChange}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <h4>Material Design Colors</h4>
            <TagFilterPrimeReact
              tagList={sampleTags.slice(18, 24)}
              enableTagColors={true}
              colorScheme="material"
              multiSelect={true}
              maxSelections={6}
              onSelectionChange={handlePrimeReactChange}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <h4>No Colors (Default PrimeReact Styling)</h4>
            <TagFilterPrimeReact
              tagList={sampleTags.slice(24, 30)}
              enableTagColors={false}
              multiSelect={true}
              maxSelections={6}
              onSelectionChange={handlePrimeReactChange}
            />
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Ant Design Tag Filter</h2>
        <p>Selected: {antdSelection.join(', ') || 'None'}</p>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Tag Display Mode</h3>
          <TagFilterAntd
            tagList={sampleTags}
            display="tag"
            multiSelect={true}
            allowDeselect={true}
            maxSelections={5}
            onSelectionChange={handleAntdChange}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Checkable Tag Mode</h3>
          <TagFilterAntd
            tagList={sampleTags}
            display="checkable-tag"
            multiSelect={true}
            allowDeselect={true}
            maxSelections={4}
            onSelectionChange={handleAntdChange}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Button Display Mode</h3>
          <TagFilterAntd
            tagList={sampleTags}
            display="button"
            size="middle"
            type="default"
            multiSelect={false}
            onSelectionChange={handleAntdChange}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Data-Driven Example (CMS Integration)</h2>
        <p>Tags loaded from CMS data structure</p>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>PrimeReact with CMS Data</h3>
          <TagFilterPrimeReact
            tagDataSource="cmsData"
            tagDataPath="categories.items"
            tagField="name"
            display="chip"
            multiSelect={true}
            allowDeselect={true}
            cmsData={sampleCMSData}
            onSelectionChange={(selected, clicked) => {
              console.log('CMS PrimeReact selection:', { selected, clicked });
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Ant Design with CMS Data</h3>
          <TagFilterAntd
            tagDataSource="cmsData"
            tagDataPath="categories.items"
            tagField="name"
            display="checkable-tag"
            multiSelect={true}
            allowDeselect={true}
            cmsData={sampleCMSData}
            onSelectionChange={(selected, clicked) => {
              console.log('CMS Ant Design selection:', { selected, clicked });
            }}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Event Handling Demo</h2>
        <p>Listen for custom events in the browser console</p>
        <button 
          onClick={() => {
            // Add event listener for custom tag filter events
            if (typeof window !== 'undefined') {
              window.addEventListener('tag-filter-selection-change', (event) => {
                console.log('Custom event received:', event.detail);
              });
              alert('Event listener added! Check console for tag-filter-selection-change events.');
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Event Listener
        </button>
      </div>
    </div>
  );
};

export default TagFilterExample; 