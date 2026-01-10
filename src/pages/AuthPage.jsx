// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { auth, signInWithGoogle } from '../services/firebase.js'; 
// import { 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword,
//   updateProfile 
// } from "firebase/auth";
// import { Mail, Lock, User, ArrowRight, Chrome, Eye, EyeOff } from 'lucide-react';
// import toast from 'react-hot-toast';


// const AuthPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [fullName, setFullName] = useState(''); 
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const from = location.state?.from || '/';

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       if (isLogin) {
//         await signInWithEmailAndPassword(auth, email, password);
//         toast.success('Welcome back!');
//       } else {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         await updateProfile(userCredential.user, {
//           displayName: fullName
//         });
//         toast.success('Account created successfully!');
//       }
//       navigate(from, { replace: true });
//     } catch (err) {
//       if (err.code === 'auth/email-already-in-use') {
//         setError("This email is already registered. Try logging in.");
//       } else if (err.code === 'auth/weak-password') {
//         setError("Password should be at least 6 characters.");
//       } else if (err.code === 'auth/invalid-credential') {
//         setError("Invalid email or password.");
//       } else {
//         setError(err.message.replace("Firebase: ", ""));
//       }
//       toast.error('Authentication failed');
//     } finally {
//       setLoading(false);  
//     }
//   };

//   const handleGoogleClick = async () => {
//     setError('');
//     try {
//       await signInWithGoogle();
//       toast.success('Signed in with Google!');
//       navigate(from, { replace: true });
//     } catch (err) {
//       setError("Google sign-in was interrupted. Please try again.");
//     }
//   };

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center px-4">
//       <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(37,_99,_235,_0.4)]">
        
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-slate-900">
//             {isLogin ? 'Welcome Back' : 'Create Account'}
//           </h2>
//           <p className="text-slate-500 mt-2 text-sm">
//             {isLogin 
//               ? 'Enter your credentials to access Civic Lens' 
//               : 'Join your community to start tracking civic data'}
//           </p>
//         </div>

//         {error && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleAuth} className="space-y-4">
//           {!isLogin && (
//             <div className="relative">
//               <User className="absolute left-3 top-3 text-slate-400" size={18} />
//               <input 
//                 type="text" 
//                 placeholder="Full Name"
//                 onChange={(e) => setFullName(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                 required
//               />
//             </div>
//           )}

//           <div className="relative">
//             <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
//             <input 
//               type="email" 
//               placeholder="Email Address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//               required
//             />
//           </div>

//           <div className="relative">
//             <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
//             <input 
//               type={showPassword ? "text" : "password"} 
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//               required
//             />
//             {/* Visibility Toggle Button */}
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors"
//             >
//               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>

//           <button 
//             type="submit" 
//             disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] shadow-lg shadow-blue-100"
//           >
//             {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
//             {!loading && <ArrowRight size={18} />}
//           </button>
//         </form>

//         <div className="mt-6">
//           <div className="relative flex items-center justify-center mb-6">
//             <div className="border-t border-slate-200 dark:border-slate-700 w-full"></div>
//             <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 uppercase absolute">Or continue with</span>
//           </div>

    
//           <button 
//   type="button"
//   onClick={handleGoogleClick}
//   className="w-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg flex items-center justify-center gap-3 transition-all"
// >
//   {/* Official Google Color SVG */}
//   <svg width="18" height="18" viewBox="0 0 24 24">
//     <path
//       fill="#4285F4"
//       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//     />
//     <path
//       fill="#34A853"
//       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//     />
//     <path
//       fill="#FBBC05"
//       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
//     />
//     <path
//       fill="#EA4335"
//       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//     />
//   </svg>
//   Google
// </button>

//         </div>

//         <div className="mt-8 text-center border-t border-slate-100 pt-6">
//           <p className="text-sm text-slate-600 dark:text-slate-400">
//             {isLogin ? "Don't have an account?" : "Already have an account?"}
//             <button 
//               type="button"
//               onClick={() => {
//                 setIsLogin(!isLogin);
//                 setError('');
//                 setShowPassword(false); // Reset visibility on switch
//               }}
//               className="ml-2 text-blue-600 font-bold hover:underline"
//             >
//               {isLogin ? 'Register here' : 'Login here'}
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthPage;


import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, signInWithGoogle } from '../services/firebase.js'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { Mail, Lock, User, ArrowRight, Chrome, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from || '/';

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: fullName
        });
        toast.success('Account created successfully!');
      }
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Try logging in.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else {
        setError(err.message.replace("Firebase: ", ""));
      }
      toast.error('Authentication failed');
    } finally {
      setLoading(false);  
    }
  };

  const handleGoogleClick = async () => {
    setError('');
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google!');
      navigate(from, { replace: true });
    } catch (err) {
      setError("Google sign-in was interrupted. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden group">
      
      {/* 1. BACKGROUND LAYER: The "bg.jpg" image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/bg1.jpeg" 
          alt="Topographic Background" 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Soft Overlays for depth and readability */}
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-slate-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/60"></div>
      </div>

      {/* 2. LOGIN CARD LAYER: Zooming, Lifting, and Glowing */}
      <div className="relative z-10 max-w-md w-full bg-white dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-8 border border-white/40 shadow-2xl transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(37,99,235,0.45)]">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {isLogin 
              ? 'Enter your credentials to access Civic Lens' 
              : 'Join your community to start tracking civic data'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative group/input">
              <User className="absolute left-3 top-3 text-slate-400 transition-colors group-focus-within/input:text-blue-500" size={18} />
              <input 
                type="text" 
                placeholder="Full Name"
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
          )}

          <div className="relative group/input">
            <Mail className="absolute left-3 top-3 text-slate-400 transition-colors group-focus-within/input:text-blue-500" size={18} />
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div className="relative group/input">
            <Lock className="absolute left-3 top-3 text-slate-400 transition-colors group-focus-within/input:text-blue-500" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-slate-50/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-lg shadow-blue-200 hover:shadow-blue-400/40"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-200 dark:border-slate-700 w-full"></div>
            <span className="bg-white dark:bg-slate-900/0 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">Or continue with</span>
          </div>

          <button 
            type="button"
            onClick={handleGoogleClick}
            className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-white dark:bg-slate-900 hover:border-blue-200 text-slate-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-md active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </div>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setShowPassword(false);
              }}
              className="ml-2 text-blue-600 font-bold hover:underline decoration-2 underline-offset-4"
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