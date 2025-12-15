import React from 'react';
import { Card } from 'primereact/card';

/**
 * SimpleCard - A flexible card component for displaying content with header, footer, and body
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card header title
 * @param {string} props.subtitle - Card header subtitle
 * @param {ReactNode} props.header - Custom header content (overrides title/subtitle)
 * @param {ReactNode} props.footer - Footer content
 * @param {ReactNode} props.children - Card body content
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 * @param {boolean} props.shadow - Show shadow/elevation
 * @param {string} props.width - Card width (e.g., '300px', '100%')
 * @param {string} props.height - Card height (e.g., '400px', 'auto')
 * @param {string} props.padding - Card padding
 * @param {string} props.backgroundColor - Background color
 * @param {string} props.borderColor - Border color
 * @param {boolean} props.bordered - Show border
 * @param {string} props.borderRadius - Border radius
 * @param {function} props.onClick - Click handler for the card
 * @param {boolean} props.hoverable - Enable hover effects
 */
const SimpleCard = ({
  title = '',
  subtitle = '',
  header = null,
  footer = null,
  children = null,
  className = '',
  style = {},
  shadow = true,
  width = 'auto',
  height = 'auto',
  padding = '1rem',
  backgroundColor = '#ffffff',
  borderColor = '#dee2e6',
  bordered = true,
  borderRadius = '6px',
  onClick = null,
  hoverable = false,
  headerImage = null,
  headerImageAlt = '',
  headerImageHeight = '200px',
  ...otherProps
}) => {
  // Build card styles
  const cardStyle = {
    width,
    height,
    backgroundColor,
    borderColor: bordered ? borderColor : 'transparent',
    borderWidth: bordered ? '1px' : '0',
    borderStyle: 'solid',
    borderRadius,
    cursor: onClick ? 'pointer' : 'default',
    transition: hoverable ? 'all 0.3s ease' : 'none',
    boxShadow: shadow ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
    ...style
  };

  // Add hover styles if enabled
  const hoverClass = hoverable ? 'simple-card-hoverable' : '';

  // Create header element if title or subtitle provided
  const cardHeader = header || (title || subtitle ? (
    <div>
      {title && <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>}
      {subtitle && <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d', fontSize: '0.875rem' }}>{subtitle}</p>}
    </div>
  ) : null);

  // Handle header image
  const headerContent = headerImage ? (
    <div>
      <img 
        src={headerImage} 
        alt={headerImageAlt} 
        style={{ 
          width: '100%', 
          height: headerImageHeight, 
          objectFit: 'cover',
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius
        }} 
      />
      {cardHeader && <div style={{ padding: '1rem' }}>{cardHeader}</div>}
    </div>
  ) : cardHeader;

  return (
    <>
      <style jsx>{`
        .simple-card-hoverable:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
      `}</style>
      <Card
        title={null}
        header={headerContent}
        footer={footer}
        className={`${className} ${hoverClass}`.trim()}
        style={cardStyle}
        onClick={onClick}
        pt={{
          body: { style: { padding } },
          content: { style: { padding: '0' } }
        }}
        {...otherProps}
      >
        {children}
      </Card>
    </>
  );
};

export default SimpleCard;
