import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<Props> = ({ label, error, className = '', ...props }) => (
  <div className="field">
    {label && <label>{label}</label>}
    <input {...props} className={className} />
    {error && <small className="muted" style={{ color: 'var(--danger)' }}>{error}</small>}
  </div>
);
