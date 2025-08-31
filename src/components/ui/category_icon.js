// src/components/ui/CategoryIcon.js
import React from 'react';
import { getCategoryInfo } from '../../utils/calculations_js';

const CategoryIcon = ({ categoryId, categories, size = 'md' }) => {
  // Handle both string and number category IDs
  const category = getCategoryInfo(categories, categoryId);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl'
  };

  return (
    <div className={`${category.color} rounded-lg flex items-center justify-center ${sizeClasses[size]}`}>
      {category.icon}
    </div>
  );
};

export default CategoryIcon;