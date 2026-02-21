import React from 'react';

/**
 * A reusable Button component - This is the core idea of a component library!
 * @param {string} [props.variant='primary'] - primary, secondary, danger, ghost
 * @param {string} [props.size='md'] - sm, md, lg
 * @param {boolean} [props.rounded=false] - If true, the button will be pill-shaped
 * @param {boolean} [props.circle=false] - If true, the button will be a circle (best with just an icon)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.disabled=false] - If true, the button will be disabled
 * @param {boolean} [props.loading=false] - If true, the button will show a loading spinner
 * @param {React.ElementType} [props.icon] - Optional Lucide icon to display
 */
const Button = ({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md',        
    className = '', 
    disabled = false,
    loading = false,     
    icon: Icon,          
    rounded = false,     
    circle = false,      
    ...props 
}) => {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: circle ? '50%' : rounded ? '9999px' : '6px',
        fontWeight: '500',
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        border: 'none',
        opacity: (disabled || loading) ? 0.6 : 1,
        fontFamily: 'inherit',
        overflow: 'hidden',
        flexShrink: 0,
    };

    const variants = {
        primary: { backgroundColor: '#7289da', color: 'white' },
        secondary: { backgroundColor: '#4f545c', color: 'white' },
        danger: { backgroundColor: '#ef4444', color: 'white' },
        ghost: { backgroundColor: 'transparent', color: '#7289da' }
    };

    const sizes = {
        sm: { 
            padding: circle ? '0' : '4px 8px', 
            fontSize: '12px',
            width: circle ? '32px' : 'auto',
            height: circle ? '32px' : 'auto'
        },
        md: { 
            padding: circle ? '0' : '10px 16px', 
            fontSize: '14px',
            width: circle ? '40px' : 'auto',
            height: circle ? '40px' : 'auto'
        },
        lg: { 
            padding: circle ? '0' : '12px 24px', 
            fontSize: '16px',
            width: circle ? '48px' : 'auto',
            height: circle ? '48px' : 'auto'
        },
    };

    const combinedStyle = {
        ...baseStyle,
        ...variants[variant],
        ...sizes[size],
        ...props.style // Merge external styles
    };

    return (
        <button 
            {...props}
            style={combinedStyle} 
            onClick={onClick} 
            disabled={disabled || loading}
            className={`custom-button ${className}`}
        >
            {Icon && (
                <Icon 
                    size={size === 'sm' ? 14 : 18} 
                    className={loading ? "animate-spin" : ""} 
                />
            )}
            {children}
        </button>
    );
};

export default Button;
