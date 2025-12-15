'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Users } from 'lucide-react';

const TagFilterPrimeReact = ({
  // Data props
  tagList = [],
  tagDataSource = 'props',
  tagDataPath = '',
  tagField = 'name',
  
  // Behavior props
  multiSelect = true,
  allowDeselect = true,
  maxSelections = 10,
  defaultSelected = [],
  stateKey = 'selectedTags',
  
  // Search props
  showSearch = true,
  searchPlaceholder = 'Search tags...',
  searchDebounceMs = 300,
  searchLabel = 'Search',
  selectedLabel = 'Selected',
  showSearchLabel = false,
  
  // Color props
  enableTagColors = true,
  colorScheme = 'default', // 'default', 'rainbow', 'pastel', 'material'
  
  // Event handlers
  onSelectionChange,
  onTagClick,
  
  // Visual props
  display = 'tag',
  size = 'medium',
  severity = undefined,
  icon = null,
  iconPos = 'left',
  
  // Plasmic data context
  pageData,
  queryData,
  cmsData,
  
  ...props
}) => {
  // State
  const [selectedTags, setSelectedTags] = useState(defaultSelected);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [tempSelectedTags, setTempSelectedTags] = useState(defaultSelected);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [visibleTagCount, setVisibleTagCount] = useState(selectedTags.length);
  
  // Refs
  const searchInputRef = useRef(null);
  const overlayPanelRef = useRef(null);
  const tagContainerRef = useRef(null);
  
  // Get tags from data source
  const getTagsFromDataSource = useCallback(() => {
    let sourceData;
    
    switch (tagDataSource) {
      case 'pageData':
        sourceData = pageData;
        break;
      case 'queryData':
        sourceData = queryData;
        break;
      case 'cmsData':
        sourceData = cmsData;
        break;
      default:
        return tagList;
    }
    
    if (!sourceData || !tagDataPath) return tagList;
    
    const pathParts = tagDataPath.split('.');
    let result = sourceData;
    
    for (const part of pathParts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return tagList;
      }
    }
    
    if (Array.isArray(result)) {
      return result.map(item => 
        typeof item === 'object' ? item[tagField] : item
      ).filter(Boolean);
    }
    
    return tagList;
  }, [tagDataSource, tagDataPath, tagField, tagList, pageData, queryData, cmsData]);
  
  const availableTags = getTagsFromDataSource();
  
  // Calculate visible tag count based on container width
  useEffect(() => {
    if (selectedTags.length === 0) {
      setVisibleTagCount(0);
      return;
    }

    // Delay calculation to ensure ref is populated
    const timer = setTimeout(() => {
      const containerWidth = tagContainerRef.current?.offsetWidth || 400;
      const averageChipWidth = 120; // Approximate width per chip including gap
      const plusBadgeWidth = 50; // Width for "+X" badge
      
      // First check if all tags can fit without "+X" badge
      const allTagsWidth = selectedTags.length * averageChipWidth;
      if (allTagsWidth <= containerWidth) {
        setVisibleTagCount(selectedTags.length);
        return;
      }
      
      // Otherwise, calculate with "+X" badge space reserved
      const availableWidth = containerWidth - plusBadgeWidth;
      const maxVisible = Math.floor(availableWidth / averageChipWidth);
      
      // Show at least 1 tag
      setVisibleTagCount(Math.max(1, maxVisible));
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedTags]);
  
  // Color generation functions
  const generateTagColor = useCallback((tag, index) => {
    if (!enableTagColors) return undefined;
    
    // Generate consistent color based on tag string hash
    const hash = tag.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    switch (colorScheme) {
      case 'rainbow':
        return `hsl(${Math.abs(hash) % 360}, 75%, 65%)`;
      
      case 'pastel':
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 75%)`;
      
      case 'material':
        const materialColors = [
          '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
          '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
          '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
          '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#795548'
        ];
        return materialColors[Math.abs(hash) % materialColors.length];
      
      default: // default - medium contrast, professional colors
        const defaultColors = [
          '#bbdefb', '#f8bbd9', '#c8e6c9', '#fff9c4', '#ffccbc',
          '#d1c4e9', '#c5cae9', '#b3e5fc', '#f0f4c3', '#e1bee7',
          '#b2dfdb', '#f3e5f5', '#e8eaf6', '#e0f2f1', '#f1f8e9',
          '#fff3e0', '#fce4ec', '#e8f5e8', '#e3f2fd', '#f3e5f5'
        ];
        return defaultColors[Math.abs(hash) % defaultColors.length];
    }
  }, [enableTagColors, colorScheme]);
  
  // Generate text color based on background color for better contrast
  const getTextColor = useCallback((backgroundColor) => {
    if (!backgroundColor) return undefined;
    
    // Convert hex to RGB for brightness calculation
    if (backgroundColor.startsWith('#')) {
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Calculate brightness using YIQ formula
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      // Return dark text for light backgrounds, light text for dark backgrounds
      return brightness > 128 ? '#2c3e50' : '#ffffff';
    }
    
    // For HSL colors, use a simpler approach
    if (backgroundColor.startsWith('hsl')) {
      // Extract lightness value
      const lightnessMatch = backgroundColor.match(/,\s*(\d+)%,\s*(\d+)%/);
      if (lightnessMatch) {
        const lightness = parseInt(lightnessMatch[2]);
        return lightness > 60 ? '#2c3e50' : '#ffffff';
      }
    }
    
    // Default fallback
    return '#2c3e50';
  }, []);
  
  // Create color map for tags - memoized for performance
  const tagColorMap = useMemo(() => {
    const map = new Map();
    availableTags.forEach((tag, index) => {
      map.set(tag, generateTagColor(tag, index));
    });
    return map;
  }, [availableTags, generateTagColor]);
  
  // Filter tags based on search
  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get unique tags that are not already selected
  const uniqueAvailableTags = filteredTags.filter(tag => 
    !selectedTags.includes(tag)
  );
  
  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);
  
  // Handle tag selection
  const handleTagSelect = useCallback((tag) => {
      if (selectedTags.includes(tag)) {
        if (allowDeselect) {
        const newSelected = selectedTags.filter(t => t !== tag);
        setSelectedTags(newSelected);
      }
    } else {
      if (multiSelect) {
        if (selectedTags.length < maxSelections) {
          const newSelected = [...selectedTags, tag];
          setSelectedTags(newSelected);
        }
      } else {
        setSelectedTags([tag]);
      }
    }
    
    // Don't close overlay - let user select multiple items
    // They'll close it with the "Done" button
  }, [selectedTags, allowDeselect, multiSelect, maxSelections]);
  
  // Handle temporary tag selection in multi-select mode
  const handleTempTagToggle = useCallback((tag) => {
    if (tempSelectedTags.includes(tag)) {
      setTempSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      if (tempSelectedTags.length < maxSelections) {
        setTempSelectedTags(prev => [...prev, tag]);
      }
    }
  }, [tempSelectedTags, maxSelections]);

  // Handle select all functionality
  const handleSelectAll = useCallback(() => {
    const allAvailableTags = uniqueAvailableTags.slice(0, maxSelections);
    setTempSelectedTags(allAvailableTags);
  }, [uniqueAvailableTags, maxSelections]);

  // Handle deselect all functionality
  const handleDeselectAll = useCallback(() => {
    setTempSelectedTags([]);
  }, []);
  
  // Apply temporary selections
  const handleApplySelection = useCallback(() => {
    setSelectedTags(tempSelectedTags);
    onSelectionChange?.(tempSelectedTags);
    setIsOverlayVisible(false);
    if (overlayPanelRef.current) {
      overlayPanelRef.current.hide();
    }
    setSearchQuery('');
    setIsMultiSelectMode(false);
  }, [tempSelectedTags, onSelectionChange]);
  
  // Cancel multi-select mode
  const handleCancelSelection = useCallback(() => {
    setTempSelectedTags(selectedTags);
    setIsMultiSelectMode(false);
    setSearchQuery('');
  }, [selectedTags]);
  
  // Close dropdown
  const handleCloseDropdown = useCallback(() => {
    setIsOverlayVisible(false);
    if (overlayPanelRef.current) {
      overlayPanelRef.current.hide();
    }
    setSearchQuery('');
    setIsMultiSelectMode(false);
    setTempSelectedTags(selectedTags);
  }, [selectedTags]);
  
  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    setIsOverlayVisible(true);
    setTempSelectedTags(selectedTags);
    if (overlayPanelRef.current) {
      overlayPanelRef.current.show(null, searchInputRef.current);
    }
  }, [selectedTags]);
  
  // Handle search key down
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsOverlayVisible(false);
      if (overlayPanelRef.current) {
        overlayPanelRef.current.hide();
      }
    }
  }, []);
  
  // Handle tag removal (only when clicking X icon)
  const handleTagRemove = useCallback((tagToRemove, e) => {
    e.stopPropagation(); // Prevent tag click event
    
    if (allowDeselect) {
      const newSelected = selectedTags.filter(t => t !== tagToRemove);
      setSelectedTags(newSelected);
      onSelectionChange?.(newSelected, tagToRemove);
    }
  }, [selectedTags, allowDeselect, onSelectionChange]);

  // Handle remove all selected tags
  const handleRemoveAll = useCallback(() => {
    if (allowDeselect) {
      setSelectedTags([]);
      onSelectionChange?.([], null);
    }
  }, [allowDeselect, onSelectionChange]);
  
  // Handle tag click (for general tag interaction)
  const handleTagClick = useCallback((tag) => {
    onTagClick?.(tag, selectedTags);
  }, [onTagClick, selectedTags]);
  
  // Render tag element based on display prop
  const renderTagElement = (tag, isSelected = false) => {
    const tagColor = tagColorMap.get(tag);
    const textColor = getTextColor(tagColor);
    
    const commonProps = {
      key: tag,
      onClick: () => handleTagClick(tag),
      style: { 
        cursor: 'pointer',
        margin: '2px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        ...(tagColor && { backgroundColor: tagColor }),
        ...(textColor && { color: textColor })
      }
    };
    
    if (isSelected) {
      // Render selected tag with remove functionality
    switch (display) {
        case 'chip':
          return (
            <Chip
              {...commonProps}
              label={tag}
              removable={allowDeselect}
              onRemove={(e) => handleTagRemove(tag, e)}
              severity={severity}
              size={size}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            />
          );
        
        case 'button':
          return (
            <Button
              {...commonProps}
              label={tag}
              icon={icon || 'pi pi-times'}
              iconPos={iconPos}
              severity={severity}
              size={size}
              onClick={(e) => handleTagRemove(tag, e)}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor, borderColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            />
          );
        
        case 'badge':
        return (
            <Badge
              {...commonProps}
            value={tag}
              severity={severity}
              size={size}
              onClick={(e) => handleTagRemove(tag, e)}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            />
          );
        
        default: // tag
          return (
            <Tag
              {...commonProps}
              value={tag}
              severity={severity}
              size={size}
              style={{
                ...commonProps.style,
                position: 'relative',
                paddingRight: allowDeselect ? '24px' : '8px',
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            >
              {allowDeselect && (
                <span
                  onClick={(e) => handleTagRemove(tag, e)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: textColor || '#666',
                    lineHeight: 1,
                    padding: '2px',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = textColor === '#ffffff' ? '#333' : '#f0f0f0';
                    e.target.style.color = textColor === '#ffffff' ? '#ffffff' : '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = textColor || '#666';
                  }}
                >
                  ×
                </span>
              )}
            </Tag>
          );
      }
    } else {
      // Render unselected tag (in dropdown)
      switch (display) {
      case 'chip':
        return (
          <Chip
              {...commonProps}
            label={tag}
              size={size}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
          />
        );
        
      case 'button':
        return (
          <Button
              {...commonProps}
            label={tag}
            icon={icon}
            iconPos={iconPos}
              size={size}
              outlined
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor, borderColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
          />
        );
        
      case 'badge':
        return (
            <Badge
              {...commonProps}
              value={tag}
              size={size}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            />
          );
        
        default: // tag
        return (
          <Tag
              {...commonProps}
            value={tag}
              size={size}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            />
          );
      }
    }
  };
  
  return (
    <div 
      className="tag-filter-container"
      style={{ 
        position: 'relative',
        maxWidth: '600px'
      }}
      {...props}
    >
      {/* Selection Bar - Always Visible */}
      <div
        ref={searchInputRef}
        onClick={handleSearchFocus}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 12px',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          height: '2.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#2196f3';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(33, 150, 243, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#dee2e6';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}
      >
        {/* Icon */}
        <span style={{ 
          color: '#60a5fa',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <Users size={18} color="#60a5fa" />
        </span>

        {/* Display selected tags as chips inside the bar */}
        <div 
          ref={tagContainerRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flex: 1,
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          {selectedTags.length > 0 ? (
            <>
              {selectedTags.slice(0, visibleTagCount).map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  removable={allowDeselect}
                  onRemove={(e) => {
                    e.stopPropagation();
                    handleTagRemove(tag, e);
                  }}
                  style={{
                    backgroundColor: '#2196f3',
                    color: '#ffffff',
                    fontSize: '12px',
                    height: '24px',
                    padding: '0',
                    flexShrink: 0
                  }}
                />
              ))}
              {selectedTags.length > visibleTagCount && (
                <span style={{
                  backgroundColor: '#e3f2fd',
                  color: '#2196f3',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0
                }}>
                  +{selectedTags.length - visibleTagCount}
                </span>
              )}
            </>
          ) : (
            <span style={{ 
              color: '#999', 
              fontSize: '14px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {searchPlaceholder || 'Select tags...'}
            </span>
          )}
        </div>
        
        {/* Dropdown indicator */}
        <span style={{ 
          color: '#999',
          fontSize: '10px',
          transition: 'transform 0.2s ease',
          transform: isOverlayVisible ? 'rotate(180deg)' : 'rotate(0deg)',
          flexShrink: 0,
          marginLeft: '4px'
        }}>
          ▼
        </span>
      </div>

      {/* Dropdown Panel - Opens below the bar */}
      <OverlayPanel
        ref={overlayPanelRef}
        appendTo={typeof document !== 'undefined' ? document.body : null}
        style={{ 
          width: 'auto',
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 1000,
          padding: 0
        }}
        onHide={() => {
          setIsOverlayVisible(false);
          setSearchQuery('');
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '0',
          backgroundColor: '#ffffff',
          width: Math.min(searchInputRef.current?.offsetWidth || 350, window.innerWidth - 32) + 'px',
          maxWidth: '100%'
        }}>
          {/* Header with Close Button */}
          <div style={{ 
            padding: '12px 16px',
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseDropdown();
              }}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#666',
                cursor: 'pointer',
                fontSize: '20px',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0f0f0';
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#666';
              }}
              title="Close"
            >
              ×
            </button>
          </div>

          {/* Checkbox List */}
          <div style={{ 
            padding: '12px 16px',
            maxHeight: '320px',
            overflowY: 'auto'
          }}>
            {filteredTags.length === 0 ? (
              <div style={{ 
                padding: '20px 12px', 
                textAlign: 'center', 
                color: '#999',
                fontSize: '14px'
              }}>
                {searchQuery ? 'No matching tags found' : 'No tags available'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {filteredTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <label
                      key={tag}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        color: '#333',
                        padding: '8px 4px',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTagSelect(tag)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#2196f3',
                          flexShrink: 0
                        }}
                      />
                      <span style={{ 
                        flex: 1,
                        userSelect: 'none'
                      }}>{tag}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons at Bottom */}
          <div style={{ 
            display: 'flex',
            gap: '12px',
            padding: '12px 16px 16px 16px',
            borderTop: '1px solid #e9ecef',
            backgroundColor: '#ffffff'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveAll();
              }}
              style={{
                flex: 1,
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                color: '#2196f3',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0f7ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ffffff';
              }}
            >
              Clear
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseDropdown();
                onSelectionChange?.(selectedTags);
              }}
              style={{
                flex: 1,
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#2196f3',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1976d2';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2196f3';
              }}
            >
              Done
            </button>
          </div>
        </div>
      </OverlayPanel>
    </div>
  );
};

export default TagFilterPrimeReact; 