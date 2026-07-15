import React from 'react';

export interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button 
      onClick={onClick} 
      style={{ 
        padding: '8px 16px', 
        borderRadius: '4px',
        backgroundColor: '#0066cc',
        color: '#fff',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      {label}
    </button>
  );
};

export const LoadingIndicator: React.FC = () => {
  return <div style={{ fontSize: '14px', color: '#666' }}>Loading...</div>;
};
