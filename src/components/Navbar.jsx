import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom'; 
import { Search, Menu, X, LogOut, Sun, Moon, Globe } from 'lucide-react'; 
import { auth } from '../services/firebase.js'; 
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Theme state
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply theme to <html>
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleShareClick = () => {
    if (user) {
      navigate('/scan');
    } else {
      navigate('/login', { state: { from: '/scan' } });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const navLinkStyles = ({ isActive }) => 
    `relative py-2 px-1 text-sm font-semibold transition-all duration-300
    ${isActive 
      ? "text-blue-600 dark:text-blue-400" 
      : "text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"}`;

  return (
    <nav className=" top-0 z-[9999] transition-all duration-500 px-4 pt-4">
      <div className={`max-w-7xl mx-auto px-6 md:px-8 py-3 rounded-2xl transition-all duration-300 border
        ${scrolled 
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border-slate-200 dark:border-slate-700/50" 
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

            {/* Added Community Feed Option */}
            <li>
              <NavLink to="/feed" className={navLinkStyles}>
                {({ isActive }) => (
                  <>
                    Community
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`}></span>
                  </>
                )}
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin" className={navLinkStyles}>Admin</NavLink>
            </li>

            {user && (
              <li>
                <NavLink to="/history" className={navLinkStyles}>My Reports</NavLink>
              </li>
            )}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3 relative z-[10000]">
            <button
              type="button"
              className="hidden sm:flex px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              onClick={handleShareClick}
            >
              {user ? 'Share Issues' : 'Login to Share'}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent dark:border-slate-700"
            >
              {theme === 'light' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-400" />}
            </button>

            {user && (
              <button 
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
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
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 animate-in slide-in-from-top-2">
            <NavLink to="/" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 dark:text-slate-300 font-semibold">Home</NavLink>
            <NavLink to="/feed" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 dark:text-slate-300 font-semibold">Community Feed</NavLink>
            <NavLink to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 dark:text-slate-300 font-semibold">Admin</NavLink>
            {user && (
              <NavLink to="/history" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-slate-700 dark:text-slate-300 font-semibold">My Reports</NavLink>
            )}
            <button onClick={handleShareClick} className="w-full mt-2 py-3 bg-blue-600 text-white rounded-xl font-bold">
              {user ? 'Share Issues' : 'Login to Share'}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;