import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import { supabase } from "./services/supabaseClient"; 
import { Toaster } from "react-hot-toast";

// Components
import Navbar from "./components/Navbar";
import FooterCard from "./components/FooterCard";
import CameraCapture from "./components/CameraCapture";
import MapPage from "./components/MapPage";
import RoleSelection from "./components/RoleSelection";
import ProtectedRoute from "./components/ProtectedRoute";

import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import UserHistory from "./pages/UserHistory";
import AdminDashboard from "./pages/AdminDashboard";

import AdminFeedback from "./pages/AdminFeedback";
import CommunityFeed from './pages/CommunityFeed';

import Team from "./pages/Team";


const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);




  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
      
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.uid)
            .single();
          
          if (data) {
            setUser({ ...currentUser, role: data.role });
          } else {
            setUser(currentUser); 
          }
        } catch (err) {
          console.error("Error fetching role:", err);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
    
        <div className="flex flex-col min-h-screen w-full overflow-hidden bg-primary dark:bg-primary-dark text-slate-900 dark:text-slate-50 transition-colors duration-300">
          <Toaster position="top-center" 
            reverseOrder={false} 
        containerStyle={{
          zIndex: 99999, 
          top: 60        
        }}/>
          <Navbar user={user} />

          <main className="flex-grow relative z-0">
            <Routes>
              {/* --- Public Routes (Merged) --- */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/feedback" element={<Feedback />} />
              
              {/* Note: Team Lead used /map, you used /issues. Keeping yours for consistency */}
              <Route path="/issues" element={<MapPage />} /> 
              <Route path="/community" element={<CommunityFeed />} />
              <Route path="/team" element={<Team />} />

              {/* --- Auth Routes (Using your Logic with RoleSelection) --- */}
              <Route
                path="/login"
                element={!user ? <RoleSelection /> : <Navigate to="/" replace />}
              />
              <Route
                path="/auth"
                element={!user ? <AuthPage /> : <Navigate to="/" replace />}
              />

              {/* --- User Protected Routes --- */}
              <Route path="/scan" element={<CameraCapture />} />
              <Route path="/history" element={<UserHistory />} />

              {/* --- Admin Protected Routes (Your Additions) --- */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute user={user} requiredRole="official">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/feedback" 
                element={
                  <ProtectedRoute user={user} requiredRole="official">
                    <AdminFeedback />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>

          <FooterCard />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;