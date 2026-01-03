import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Hook for your 'Scan' navigation

  const navLinkStyles = ({ isActive }) => 
    isActive 
      ? "text-blue-600 font-semibold" 
      : "text-gray-600 hover:text-blue-600 font-medium transition-colors";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 md:px-8 py-4">
  
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">CivicLens</span>
        </Link>

        {/* DESKTOP NAV LINKS (Team Lead's Links) */}
        <ul className="hidden md:flex items-center gap-8 text-sm">
          <li><NavLink to="/" className={navLinkStyles}>Home</NavLink></li>
          <li><NavLink to="/explore" className={navLinkStyles}>Explore Data</NavLink></li>
          <li><NavLink to="/issues" className={navLinkStyles}>Local Issues</NavLink></li>
          {/* You can manually add <NavLink to="/history">My Reports</NavLink> here if you want it always visible */}
        </ul>

        {/* ACTION BUTTONS (Right Side) */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Search Button (Team Lead's Design) */}
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <Search size={20} />
          </button>
          
          {/* YOUR FEATURE: Share Issues Button -> Goes to /scan */}
          <button 
            onClick={() => navigate('/scan')}
            className="hidden sm:block px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Share Issues
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg">
          <ul className="flex flex-col gap-4 text-sm font-medium">
            <li><NavLink to="/" onClick={() => setIsOpen(false)} className={navLinkStyles}>Home</NavLink></li>
            <li><NavLink to="/explore" onClick={() => setIsOpen(false)} className={navLinkStyles}>Explore Data</NavLink></li>
            <li><NavLink to="/issues" onClick={() => setIsOpen(false)} className={navLinkStyles}>Local Issues</NavLink></li>
          </ul>
          
          {/* Mobile Share Button */}
          <button 
            onClick={() => { navigate('/scan'); setIsOpen(false); }}
            className="block w-full text-center py-3 bg-blue-600 text-white font-semibold rounded-lg"
          >
            Share Issues
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;