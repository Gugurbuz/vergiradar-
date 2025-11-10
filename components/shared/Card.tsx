
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  dragHandleClassName?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, dragHandleClassName }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-xl flex flex-col ${className}`}>
      {title && (
         <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${dragHandleClassName}`}>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
      )}
      <div className="p-6 flex-grow">
        {children}
      </div>
    </div>
  );
};

export default Card;