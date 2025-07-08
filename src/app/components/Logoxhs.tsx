import React from 'react';
import './Logoxhs.css';

export const Logoxhs = ({ className = '', ...props }) => {
  return <img className={'logoxhs ' + className} src="/img/logoxhs.png" alt="小红书logo" {...props} />;
}; 