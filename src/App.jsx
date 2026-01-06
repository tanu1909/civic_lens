
import React, { useEffect, useState } from 'react';
// FIXED: Added Navigate to imports
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";

// Components
import Navbar from "./components/Navbar";
import FooterCard from "./components/FooterCard";
import CameraCapture from "./components/CameraCapture";
import MapPage from "./components/MapPage";

// Pages
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import UserHistory from "./pages/UserHistory";
import AdminFeedback from "./pages/AdminFeedback";


import Home from './pages/Home';
import Navbar from './components/Navbar';
import FooterCard from './components/FooterCard';
import AuthPage from './pages/AuthPage';
import About from './pages/About.jsx';
import Feedback from './pages/Feedback.jsx';
import CameraCapture from './components/CameraCapture';
import AdminFeedback from './pages/AdminFeedback.jsx';
import AdminDashboard from './pages/AdminDashboard'; 


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

    return <div className="flex justify-center items-center h-screen">Loading...</div>;
    return <div className="text-center mt-10">Loading...</div>;

  }

  return (
    <Router>

      <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <div className="flex flex-col min-h-screen">

        <Navbar user={user} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* FIXED: Single Login Route */}
            <Route 
              path="/login" 
              element={!user ? <AuthPage /> : <Navigate to="/" replace />} 
            />

            <Route
              path="/login"
              element={!user ? <AuthPage /> : <Navigate to="/" replace />}
            />

            {/* FIXED: Single Scan Route (Protected) */}
            <Route 
              path="/scan" 
              element={user ? <CameraCapture user={user} /> : <Navigate to="/login" state={{ from: '/scan' }} replace />} 
            />

            {/* FIXED: Single Admin Routes */}

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
            {/* Added from merge conflict resolution */}
            <Route path="/history" element={<UserHistory />} />


            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route path="/admin" element={<AdminDashboard />} />

          </Routes>
        </main>

        <FooterCard />
      </div>
    </Router>
  );
};

export default App;