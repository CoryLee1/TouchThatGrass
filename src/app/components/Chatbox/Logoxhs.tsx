import React from 'react';
import './Logoxhs.css';
import Image from 'next/image';

export const Logoxhs = ({ className = '', ...props }) => {
  return <Image className={'logoxhs ' + className} src="/img/logoxhs.png" alt="小红书logo" {...props} />;
}; 