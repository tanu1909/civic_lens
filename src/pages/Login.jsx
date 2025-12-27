import React from 'react';
import { signInWithGoogle } from '../services/firebase';

const Login = () => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      alert("Success! You are logged in.");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
      <div className="p-8 bg-slate-800 rounded-2xl shadow-2xl text-center border border-slate-700">
        <h1 className="text-4xl font-bold mb-4">Civic Lens</h1>
        <p className="text-slate-400 mb-8">Empowering communities through reporting.</p>
        <button 
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-all"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;