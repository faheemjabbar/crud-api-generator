import React from 'react';

/**
 * Loading spinner component with customizable size and color
 * @param {Object} props - Component props
 * @param {number} [props.size=24] - Size of the spinner in pixels
 * @param {string} [props.color='#5b6af0'] - Color of the spinner
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Loading spinner component
 */
const LoadingSpinner = ({ size = 24, color = '#5b6af0', className = '' }) => {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `2px solid transparent`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className={className} style={spinnerStyle} />
    </>
  );
};

export default LoadingSpinner;