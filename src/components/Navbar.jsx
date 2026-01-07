import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom'; 
import { Search, Menu, X, LogOut } from 'lucide-react'; 
import { auth } from '../services/firebase.js'; 
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    ${isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-500"}`;

  return (
    <nav className="sticky top-0 z-50 transition-all duration-500 px-4 pt-4">
      <div className={`max-w-7xl mx-auto px-6 md:px-8 py-3 rounded-2xl transition-all duration-300 border
        ${scrolled 
          ? "bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-slate-200/50" 
          : "bg-white/70 backdrop-blur-md shadow-lg shadow-blue-500/5 border-white/40"}`}>
        
        <div className="flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
            <div className="w-9 h-9 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center transition-all group-hover:rotate-12">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">CivicLens</span>
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
              <NavLink to="/admin" className={navLinkStyles}>Admin Dashboard</NavLink>
            </li>
            <li>
              <NavLink to="/issues" className={navLinkStyles}>Local Issues</NavLink>
            </li>
            {user && (
               <li><NavLink to="/history" className={navLinkStyles}>My Reports</NavLink></li>
            )}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">
              <Search size={20} />
            </button>
            
            <button 
              className="hidden sm:flex px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
              onClick={handleShareClick}
            >
              {user ? 'Share Issues' : 'Login to Share'}
            </button>

            {user && (
              <button 
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut size={20} />
              </button>
            )}

            {/* Mobile Toggle */}
            <button className="md:hidden p-2 text-slate-600 bg-slate-50 rounded-lg" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="mt-2 mx-auto max-w-7xl md:hidden bg-white/95 backdrop-blur-xl border border-slate-100 p-6 rounded-2xl shadow-2xl space-y-4">
          <ul className="flex flex-col gap-4 text-sm font-semibold">
            <li><NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink></li>
            <li><NavLink to="/admin" onClick={() => setIsOpen(false)}>Admin Dashboard</NavLink></li>
            <li><NavLink to="/issues" onClick={() => setIsOpen(false)}>Local Issues</NavLink></li>
          </ul>
          <button 
            onClick={() => { setIsOpen(false); handleShareClick(); }}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl"
          >
            {user ? 'Share Issues' : 'Login to Share'}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;