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
import RoleSelection from "./components/RoleSelection"; // Consider moving to pages/ later

// Pages
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import UserHistory from "./pages/UserHistory";
import AdminFeedback from "./pages/AdminFeedback";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl font-semibold">Loading...</div>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar user={user} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* 1. GATEWAY: User chooses Citizen or Official */}
            <Route 
              path="/login" 
              element={!user ? <RoleSelection /> : <Navigate to="/" replace />} 
            />

            {/* 2. AUTH FORM: Where the actual login happens */}
            <Route
              path="/auth"
              element={!user ? <AuthPage /> : <Navigate to="/" replace />}
            />

            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/map" element={<MapPage />} />
            
            <Route
              path="/scan"
              element={
                user ? (
                  <CameraCapture user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            
            <Route path="/history" element={<UserHistory />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
          </Routes>
        </main>

        <FooterCard />
      </div>
    </Router>
  );
};

export default App;