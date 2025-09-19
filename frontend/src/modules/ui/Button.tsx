import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }>
  = ({ variant = 'primary', className = '', ...props }) => (
  <button {...props} className={`btn ${variant === 'secondary' ? 'secondary' : ''} ${variant === 'danger' ? 'danger' : ''} ${variant === 'ghost' ? 'ghost' : ''} ${className}`.trim()} />
);
