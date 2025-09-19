import React from 'react';

export const Card: React.FC<{ padded?: boolean; className?: string; children: React.ReactNode }> = ({ padded, className = '', children }) => (
  <div className={`card ${padded ? 'padded' : ''} ${className}`.trim()}>{children}</div>
);
