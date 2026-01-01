import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom'; 
import { Search, Menu, X, LogOut } from 'lucide-react'; 
import { auth } from '../services/firebase.js'; 
import { signOut } from 'firebase/auth';

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleShareClick = () => {
    if (user) {
      navigate('/scan');
    } else {
      // Pass the intended destination so AuthPage can redirect back
      navigate('/login', { state: { from: '/scan' } });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinkStyles = ({ isActive }) => 
    isActive 
      ? "text-blue-600 font-semibold" 
      : "text-gray-600 hover:text-blue-600 font-medium transition-colors";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 md:px-8 py-4">
  
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">CivicLens</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-sm">
          <li><NavLink to="/" className={navLinkStyles}>Home</NavLink></li>
          <li><NavLink to="/explore" className={navLinkStyles}>Explore Data</NavLink></li>
          <li><NavLink to="/issues" className={navLinkStyles}>Local Issues</NavLink></li>
        </ul>

        {/* Desktop Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <Search size={20} />
          </button>
          
          <button 
            className="hidden sm:block px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all"
            onClick={handleShareClick}
          >
            {user ? 'Share Issues' : 'Login to Share'}
          </button>

          {user && (
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg">
          <ul className="flex flex-col gap-4 text-sm font-medium">
            <li><NavLink to="/" onClick={() => setIsOpen(false)} className={navLinkStyles}>Home</NavLink></li>
            <li><NavLink to="/explore" onClick={() => setIsOpen(false)} className={navLinkStyles}>Explore Data</NavLink></li>
            <li><NavLink to="/issues" onClick={() => setIsOpen(false)} className={navLinkStyles}>Local Issues</NavLink></li>
          </ul>
          <button 
            onClick={() => { setIsOpen(false); handleShareClick(); }}
            className="block w-full text-center py-3 bg-blue-600 text-white font-semibold rounded-lg"
          >
            {user ? 'Share Issues' : 'Login to Share'}
          </button>
          {user && (
            <button onClick={handleLogout} className="w-full py-2 text-red-600 font-medium">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;