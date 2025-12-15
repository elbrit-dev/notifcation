import React from 'react';
import { Button } from 'primereact/button';

/**
 * SimpleButton - A customizable button component with PrimeReact styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Button text
 * @param {string} props.icon - Icon class name (e.g., 'pi pi-check')
 * @param {string} props.iconPos - Icon position ('left' or 'right')
 * @param {string} props.severity - Button color theme ('primary', 'secondary', 'success', 'info', 'warning', 'danger')
 * @param {string} props.size - Button size ('small', 'normal', 'large')
 * @param {boolean} props.outlined - Whether button should be outlined
 * @param {boolean} props.rounded - Whether button should have rounded corners
 * @param {boolean} props.text - Whether button should be text only (no background)
 * @param {boolean} props.raised - Whether button should have shadow
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {function} props.onClick - Click handler function
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
const SimpleButton = ({
  label = 'Click Me',
  icon = null,
  iconPos = 'left',
  severity = 'primary',
  size = 'normal',
  outlined = false,
  rounded = false,
  text = false,
  raised = false,
  loading = false,
  disabled = false,
  onClick = () => {},
  className = '',
  style = {},
  tooltip = '',
  tooltipOptions = { position: 'top' },
  badge = null,
  badgeClass = 'p-badge-danger',
  ...otherProps
}) => {
  // Map size prop to PrimeReact size classes
  const sizeClass = {
    small: 'p-button-sm',
    normal: '',
    large: 'p-button-lg'
  }[size] || '';

  // Combine all classes
  const buttonClass = `${className} ${sizeClass}`.trim();

  return (
    <Button
      label={label}
      icon={icon}
      iconPos={iconPos}
      severity={severity}
      outlined={outlined}
      rounded={rounded}
      text={text}
      raised={raised}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      className={buttonClass}
      style={style}
      tooltip={tooltip}
      tooltipOptions={tooltipOptions}
      badge={badge}
      badgeClassName={badgeClass}
      {...otherProps}
    />
  );
};

export default SimpleButton;
