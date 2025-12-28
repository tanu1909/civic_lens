import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithGoogle } from '../services/firebase.js'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Log in existing user
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // 1. Create the new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // 2. Immediately update their profile with the Full Name
        await updateProfile(userCredential.user, {
          displayName: fullName
        });
      }
      // 3. Redirect to home on success
      navigate('/');
    } catch (err) {
      // error mapping
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Try logging in.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else {
        setError(err.message.replace("Firebase: ", ""));
      }
    } finally {
      setLoading(false);  
    }
  };

  const handleGoogleClick = async () => {
    setError('');
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError("Google sign-in was interrupted. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {isLogin 
              ? 'Enter your credentials to access Civic Lens' 
              : 'Join your community to start tracking civic data'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Full Name"
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="email" 
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 uppercase absolute">Or continue with</span>
          </div>

          <button 
            type="button"
            onClick={handleGoogleClick}
            className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Chrome size={18} className="text-blue-500" />
            Google
          </button>
        </div>

        {/* Toggle Link */}
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="ml-2 text-blue-600 font-bold hover:underline"
            >
              {isLogin ? 'Register here' : 'Login here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;