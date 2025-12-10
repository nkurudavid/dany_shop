import React from 'react';

const Card = ({ 
  children, 
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  const hoverClass = hover ? 'hover:shadow-xl transition-shadow duration-300 cursor-pointer' : '';

  return (
    <div 
      className={`bg-white rounded-lg shadow-md ${paddings[padding]} ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;