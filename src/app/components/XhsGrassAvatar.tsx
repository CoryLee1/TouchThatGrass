import React from 'react';
import './XhsGrassAvatar.css';
import Image from 'next/image';

export const XhsGrassAvatar = ({ className = '', ...props }) => {
  return (
    <Image
      className={'xhs-grass-avatar ' + className}
      src="/img/xhs_Grass_Avatar.png"
      alt="草官头像"
      width={100}
      height={100}
      {...props}
    />
  );
}; 