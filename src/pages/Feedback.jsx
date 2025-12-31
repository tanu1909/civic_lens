import React from 'react';
import { Send } from 'lucide-react';

const Feedback = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-2xl font-bold">We value your feedback</h1>
          <p className="opacity-90 mt-2">How can we make CivicLens better for your community?</p>
        </div>
        
        <form className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., Feature Suggestion" />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Message</label>
            <textarea rows="5" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tell us what's on your mind..."></textarea>
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition">
            <Send size={18} />
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;