import React, { useState } from 'react';

export interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="main-header">
      <h1>{title}</h1>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
    </header>
  );
};
