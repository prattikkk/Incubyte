import React from 'react';

export const Spinner: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <span
    className="spinner"
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.2)',
      borderTopColor: 'rgba(255,255,255,0.85)',
      animation: 'spin 0.8s linear infinite'
    }}
  />
);
