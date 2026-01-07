import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import { Toaster } from "react-hot-toast";
import { doc, getDoc } from "firebase/firestore"; //for role fetching

// Components
import Navbar from "./components/Navbar";
import FooterCard from "./components/FooterCard";
import CameraCapture from "./components/CameraCapture";
import MapPage from "./components/MapPage";
import RoleSelection from "./components/RoleSelection";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";

import AuthPage from "./pages/AuthPage";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import UserHistory from "./pages/UserHistory";
import AdminFeedback from "./pages/AdminFeedback";
import AdminDashboard from "./pages/AdminDashboard";
import CommunityFeed from './pages/CommunityFeed';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch the role from Firestore 'users' collection
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...currentUser, role: userDoc.data().role });
        } else {
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
    <Router>
      <div className="flex flex-col min-h-screen w-full overflow-hidden">
        <Toaster position="top-center" reverseOrder={false} />

        <Navbar user={user} />

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />

            {/* Role Selection */}
            <Route
              path="/login"
              element={!user ? <RoleSelection /> : <Navigate to="/" replace />}
            />

            {/* Auth Page */}
            <Route
              path="/auth"
              element={!user ? <AuthPage /> : <Navigate to="/" replace />}
            />

            <Route path="/issues" element={<MapPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/scan" element={<CameraCapture />} />
            <Route path="/history" element={<UserHistory />} />
            <Route path="/community" element={<CommunityFeed />} />
           
           {/* ONLY Government Officials can see this */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute user={user} requiredRole="official">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

          </Routes>
        </main>
        
        <FooterCard />
      </div>
    </Router>
  );
};

export default App;