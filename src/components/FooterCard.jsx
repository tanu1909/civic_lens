import React from 'react';
import { Link, NavLink } from 'react-router-dom'; 
import { Mail, MessageSquare, Info,User } from 'lucide-react';

const FooterCard = () => {

const navLinkStyles = ({ isActive }) => 
    `flex items-center gap-1.5 text-sm transition-all duration-300 ${
      isActive 
        ? "text-blue-600 font-semibold" 
        : "text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium"
    }`;


  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
       
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-900">Civic Lens</span>
          <span className="hidden md:block text-slate-300">|</span>
          <p className="text-xs text-slate-500 font-medium">
            © 2026 Transparent Communities
          </p>
        </div>

       
        <div className="flex items-center gap-6">
         
          <NavLink 
            to="/about" 
            className={navLinkStyles}>
            <Info size={16} />
            <span>About</span>
          </NavLink>
          
          <NavLink 
            to="/feedback" 
            className={navLinkStyles}
          >
            <MessageSquare size={16} />
            <span>Feedback</span>
          </NavLink>

         <NavLink 
            to="/team" 
            className={navLinkStyles}
          >
          <User size={16} />
          <span>Our Team</span>
          </NavLink>
         
        </div>
      </div>
    </footer>
  );
};

export default FooterCard;




