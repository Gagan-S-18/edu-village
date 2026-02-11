import React from 'react';

/**
 * ProgressBar Component - Reusable progress visualization
 * 
 * Props:
 * - percentage: number (0-100)
 * - label: string (optional display label)
 * - size: 'small' | 'medium' | 'large' (default: 'medium')
 * - showPercentage: boolean (default: true)
 * - completed: boolean (default: false)
 * - animated: boolean (default: true)
 */
const ProgressBar = ({ 
    percentage = 0, 
    label = null,
    size = 'medium',
    showPercentage = true,
    completed = false,
    animated = true 
}) => {
    // Ensure percentage is between 0-100
    const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);
    
    // Determine color based on progress
    const getProgressColor = () => {
        if (completed) return '#22C55E'; // Green for completed
        if (normalizedPercentage >= 75) return '#1B9AAA'; // Teal for high progress
        if (normalizedPercentage >= 50) return '#06B6D4'; // Cyan for medium progress
        if (normalizedPercentage >= 25) return '#F59E0B'; // Orange for some progress
        return '#EF4444'; // Red for no progress
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    height: '6px',
                    borderRadius: '3px'
                };
            case 'large':
                return {
                    height: '12px',
                    borderRadius: '6px'
                };
            case 'medium':
            default:
                return {
                    height: '8px',
                    borderRadius: '4px'
                };
        }
    };

    const containerStyle = {
        width: '100%',
        marginBottom: label ? '0.5rem' : '0'
    };

    const labelStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        fontSize: '0.875rem'
    };

    const labelTextStyle = {
        color: '#374151',
        fontWeight: '500'
    };

    const percentageStyle = {
        color: getProgressColor(),
        fontWeight: '600'
    };

    const barContainerStyle = {
        backgroundColor: '#E5E7EB',
        borderRadius: getSizeStyles().borderRadius,
        overflow: 'hidden',
        position: 'relative'
    };

    const barFillStyle = {
        height: getSizeStyles().height,
        backgroundColor: getProgressColor(),
        width: `${normalizedPercentage}%`,
        borderRadius: getSizeStyles().borderRadius,
        transition: animated ? 'width 0.3s ease-in-out' : 'none',
        position: 'relative'
    };

    // Add animated stripes if in progress and animated
    const animationStyle = animated && normalizedPercentage < 100 ? `
        @keyframes progress-stripes {
            0% {
                background-position: 0 0;
            }
            100% {
                background-position: 20px 0;
            }
        }
        animation: progress-stripes 1s linear infinite;
    ` : '';

    return (
        <div style={containerStyle}>
            {/* Label Row */}
            {label && (
                <div style={labelStyle}>
                    <span style={labelTextStyle}>{label}</span>
                    {showPercentage && (
                        <span style={percentageStyle}>
                            {Math.round(normalizedPercentage)}%
                        </span>
                    )}
                </div>
            )}

            {/* Progress Bar */}
            <div style={barContainerStyle}>
                <div style={barFillStyle}>
                    {/* Completed checkmark */}
                    {completed && (
                        <span style={{
                            position: 'absolute',
                            right: '2px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            ✓
                        </span>
                    )}
                </div>
            </div>

            {/* Inline Percentage (if no label) */}
            {!label && showPercentage && (
                <div style={{...labelStyle, marginBottom: 0}}>
                    <span style={percentageStyle}>
                        {Math.round(normalizedPercentage)}%
                    </span>
                </div>
            )}

            <style>{animationStyle}</style>
        </div>
    );
};

export default ProgressBar;
