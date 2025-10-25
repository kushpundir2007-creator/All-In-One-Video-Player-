
import React from 'react';
import { SunIcon, MoonIcon, FilmIcon } from './icons/Icons';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="p-4 flex justify-between items-center shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <FilmIcon className="w-8 h-8 text-indigo-600"/>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">UniView Player</h1>
      </div>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
      </button>
    </header>
  );
};

export default Header;
