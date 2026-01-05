import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
// Import the db and auth from your firebase.js
import { db, auth } from '../services/firebase.js'; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const Feedback = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save to a "feedback" collection in Firestore
      await addDoc(collection(db, "feedback"), {
        subject: subject,
        message: message,
        userId: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || 'anonymous',
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-slate-900">Thank You!</h2>
          <p className="text-slate-600 mt-2">Your feedback has been received. We appreciate your input.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="mt-6 text-blue-600 font-semibold hover:underline"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-2xl font-bold">We value your feedback</h1>
          <p className="opacity-90 mt-2">How can we make CivicLens better for your community?</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
            <input 
              type="text" 
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="e.g., Feature Suggestion" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Message</label>
            <textarea 
              rows="5" 
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Tell us what's on your mind..."
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? 'Sending...' : (
              <>
                <Send size={18} />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;