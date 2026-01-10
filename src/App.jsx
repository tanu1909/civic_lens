// import React, { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "./services/firebase";
// import { Toaster } from "react-hot-toast";

// // Components
// import Navbar from "./components/Navbar";
// import FooterCard from "./components/FooterCard";
// import CameraCapture from "./components/CameraCapture";
// import MapPage from "./components/MapPage";
// import RoleSelection from "./components/RoleSelection";
// import ErrorBoundary from "./components/ErrorBoundary";

// // Pages
// import Home from "./pages/Home";
// import AuthPage from "./pages/AuthPage";
// import About from "./pages/About";
// import Feedback from "./pages/Feedback";
// import UserHistory from "./pages/UserHistory";
// import AdminFeedback from "./pages/AdminFeedback";
// import AdminDashboard from "./pages/AdminDashboard";
// import Team from "./pages/Team";

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);




//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen text-xl font-semibold">
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <ErrorBoundary>
// <Router>
//       <div className="flex flex-col min-h-screen bg-primary dark:bg-primary-dark text-slate-900 dark:text-slate-50 transition-colors duration-300">
//         <Toaster position="top-center" reverseOrder={false} />
//         <Navbar user={user} />

//         <main className="flex-grow relative z-0">
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/" element={<Home />} />
//             <Route path="/about" element={<About />} />
//             <Route path="/feedback" element={<Feedback />} />
//             <Route path="/map" element={<MapPage />} />

//             {/* Auth Routes */}
//            <Route
//   path="/login"
//   element={!user ? <AuthPage /> : <Navigate to="/" replace />}
// />
//             <Route
//               path="/auth"
//               element={!user ? <AuthPage /> : <Navigate to="/" replace />}
//             />

//             {/* Protected Routes */}
//             <Route
//               path="/scan"
//               element={
//                 user ? (
//                   <CameraCapture user={user} />
//                 ) : (
//                   <Navigate to="/login" state={{ from: "/scan" }} replace />
//                 )
//               }
//             />
//             <Route path="/history" element={<UserHistory />} />
//             <Route path="/team" element={<Team />} />

//             {/* Admin Routes */}
//             <Route path="/admin" element={<AdminDashboard />} />
//             <Route path="/admin/feedback" element={<AdminFeedback />} />
//           </Routes>
//         </main>
//         <FooterCard />
// </div>   
//     </Router>
//     </ErrorBoundary>
    
//   );
// };

// export default App;


import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import { Toaster } from "react-hot-toast";

// Components
import Navbar from "./components/Navbar";
import FooterCard from "./components/FooterCard";
import CameraCapture from "./components/CameraCapture";
import MapPage from "./components/MapPage";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import UserHistory from "./pages/UserHistory";
import AdminFeedback from "./pages/AdminFeedback";
import AdminDashboard from "./pages/AdminDashboard";
import Team from "./pages/Team";
import CommunityFeed from './pages/CommunityFeed';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-xl font-semibold">
        <div className="animate-pulse">Loading CivicLens...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        {/* Changed bg-primary to standard bg-slate-50 for reliability */}
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
          <Toaster position="top-center" reverseOrder={false} />
          <Navbar user={user} />

          <main className="flex-grow relative z-0">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/team" element={<Team />} />
              <Route path="/feed" element={<CommunityFeed />} />
              {/* Auth Routes */}
              <Route path="/login" element={!user ? <AuthPage /> : <Navigate to="/" replace />} />
              <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" replace />} />

              {/* Protected Routes */}
              <Route
                path="/scan"
                element={user ? <CameraCapture user={user} /> : <Navigate to="/login" state={{ from: "/scan" }} replace />}
              />
              <Route
                path="/history"
                element={user ? <UserHistory /> : <Navigate to="/login" replace />}
              />

              {/* Admin Routes - Added simple protection */}
              <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" replace />} />
              <Route path="/admin/feedback" element={user ? <AdminFeedback /> : <Navigate to="/login" replace />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <FooterCard />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;