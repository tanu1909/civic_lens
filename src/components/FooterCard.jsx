import React from 'react';
import { Link, NavLink } from 'react-router-dom'; 
import { Mail, MessageSquare, Info } from 'lucide-react';

const FooterCard = () => {

const navLinkStyles = ({ isActive }) => 
    `flex items-center gap-1.5 text-sm transition-all duration-300 ${
      isActive 
        ? "text-blue-600 font-semibold" 
        : "text-slate-600 hover:text-blue-600 font-medium"
    }`;


  return (
    <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
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

         
          <a 
            href="mailto:tanuchoudhary1319@gmail.com" 
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Mail size={16} />
            <span>Contact Us</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterCard;