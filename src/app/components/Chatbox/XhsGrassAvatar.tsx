import React from 'react';
import './XhsGrassAvatar.css';
import Image from 'next/image';

interface XhsGrassAvatarProps {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
  [key: string]: unknown;
}

export const XhsGrassAvatar = ({ className = '', onClick, onMouseEnter, onMouseLeave, ...props }: XhsGrassAvatarProps) => {
  return (
    <button
      type="button"
      className={'xhs-grass-avatar-btn ' + className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={0}
      {...props}
    >
      <Image
        className="xhs-grass-avatar"
        src="/img/xhs_Grass_Avatar.png"
        alt="草官头像"
        width={100}
        height={100}
        draggable={false}
      />
    </button>
  );
}; 