import React from 'react';
import { signInWithGoogle } from '../services/firebase'; // This imports your logic

const Login = () => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle(); // This triggers the popup
      alert("Success! You are logged in.");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Civic Lens</h1>
      <button 
        onClick={handleLogin}
        className="bg-blue-500 text-white px-6 py-3 rounded shadow-lg hover:bg-blue-600 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;