import React from 'react';
import './XhsGrassAvatar.css';

export const XhsGrassAvatar = ({ className = '', ...props }) => {
  return (
    <img
      className={'xhs-grass-avatar ' + className}
      src="/img/xhs_Grass_Avatar.png"
      alt="草官头像"
      {...props}
    />
  );
}; 