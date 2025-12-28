import React from 'react';
import { Search, Globe } from 'lucide-react'; 

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-full"></div> {/* Logo Placeholder */}
        <span className="text-xl font-bold text-gray-900 tracking-tight">CivicLens</span>
      </div>

      {/* Nav Links */}
      <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <li><a href="/home" className="hover:text-blue-600">Home</a></li>
        <li><a href="/explore" className="hover:text-blue-600">Explore Data</a></li>
        <li><a href="/issues" className="hover:text-blue-600">Local Issues</a></li>
        
      </ul>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <Search size={20} />
        </button>
        <button className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          Share Issues
        </button>
      </div>
    </nav>
  );
};

export default Navbar;