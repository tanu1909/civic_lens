
import React, { useState, useEffect } from 'react';

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
    setIsOpen(false); // Close mobile menu if open
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinkStyles = ({ isActive }) => 

    `relative py-2 px-1 text-sm font-semibold transition-all duration-300
    ${isActive 
      ? "text-blue-600 dark:text-blue-400" 
      : "text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400"}`;

  return (
    <nav className="sticky top-0 z-[9999] transition-all duration-500 px-4 pt-4">
      <div className={`max-w-7xl mx-auto px-6 md:px-8 py-3 rounded-2xl transition-all duration-300 border
        ${scrolled 
          ? "bg-white dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border-slate-200 dark:border-slate-700/50" 
          : "bg-white dark:bg-slate-900/70 backdrop-blur-md shadow-lg border-white/40 dark:border-slate-800/40"}`}>
        
        <div className="flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
            <div className="w-9 h-9 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center transition-all group-hover:rotate-12">
              <div className="w-3 h-3 bg-white dark:bg-slate-900 rounded-full"></div>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              CivicLens
            </span>
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <NavLink to="/" className={navLinkStyles}>
                {({ isActive }) => (
                  <>
                    Home
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`}></span>
                  </>
                )}
              </NavLink>
            </li>
            
            <li>
                <NavLink to="/community" className={navLinkStyles}>Community Feed</NavLink>
            </li>

            {user && (
              <li>
                <NavLink to="/history" className={navLinkStyles}>My Reports</NavLink>
              </li>
            )}
            
            {user?.role === 'official' && (
              <li>
                <NavLink to="/admin" className={navLinkStyles}>Admin Dashboard</NavLink>
              </li>
            )}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3 relative z-[10000]">
            
           <button
             type="button"
             className="hidden sm:flex px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 cursor-pointer pointer-events-auto"
             onClick={handleShareClick}
           >
             {user ? 'Share Issues' : 'Login to Share'}
           </button>

            {/* 🌙 Theme Toggle */
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

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-sm">
          <li><NavLink to="/" className={navLinkStyles}>Home</NavLink></li>
          <li><NavLink to="/explore" className={navLinkStyles}>Explore Data</NavLink></li>
          <li><NavLink to="/issues" className={navLinkStyles}>Local Issues</NavLink></li>
          {/* <--- by mem-2 --- */}
          {user && (
             <li><NavLink to="/history" className={navLinkStyles}>My Reports</NavLink></li>
          )}
        </ul>

        {/* Desktop Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Search Button (Team Lead's Design) */}
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

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg">
          <ul className="flex flex-col gap-4 text-sm font-medium">
            <li><NavLink to="/" onClick={() => setIsOpen(false)} className={navLinkStyles}>Home</NavLink></li>
            <li><NavLink to="/explore" onClick={() => setIsOpen(false)} className={navLinkStyles}>Explore Data</NavLink></li>
            <li><NavLink to="/issues" onClick={() => setIsOpen(false)} className={navLinkStyles}>Local Issues</NavLink></li>
            {/* <--- by mem-2 --- */}
            {user && (

              <button 
                onClick={handleLogout}
                // FIXED: Removed duplicate className
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            )}

            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg" 
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}

               <li><NavLink to="/history" onClick={() => setIsOpen(false)} className={navLinkStyles}>My Reports</NavLink></li>
            )}
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

      </div>

      {/* MOBILE MENU (Fixed with Dark Mode) */}
      {isOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-2xl z-[60] animate-in slide-in-from-top-2 fade-in duration-200">
          <ul className="flex flex-col gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <li>
              <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "text-blue-600 dark:text-blue-400" : ""}>
                Home
              </NavLink>
            </li>
            
            <li>
              <NavLink to="/community" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "text-blue-600 dark:text-blue-400" : ""}>
                Community Feed
              </NavLink>
            </li>

            {user && (
              <li>
                <NavLink to="/history" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "text-blue-600 dark:text-blue-400" : ""}>
                  My Reports
                </NavLink>
              </li>
            )}
            
            {user?.role === 'official' && (
              <li>
                <NavLink to="/admin" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "text-blue-600 dark:text-blue-400" : ""}>
                  Admin Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <button 
              onClick={handleShareClick}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              {user ? 'Share Issues' : 'Login to Share'}
            </button>
            
            {user && (
               <button 
                 onClick={handleLogout}
                 className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl active:scale-95 transition-all"
               >
                 Logout
               </button>
            )}
          </div>
        </div>

      )}
    </nav>
  );
};

export default Navbar;