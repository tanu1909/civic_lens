import React from 'react';
import { auth } from '../services/firebase'; 
import { signOut } from 'firebase/auth'; 

const Dashboard = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
          <span className="font-bold text-xl">CivicLens</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Share Issues
          </button>
          <button 
            onClick={handleLogout}
            className="border border-red-500 text-red-500 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Split Screen */}
      <main className="flex-grow flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-blue-600 flex items-center justify-center">
          <h2 className="text-white text-5xl font-bold font-sans">Civic Data</h2>
        </div>
        <div className="w-full md:w-1/2 bg-emerald-500 flex items-center justify-center">
          <h2 className="text-white text-5xl font-bold font-sans">Map</h2>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;