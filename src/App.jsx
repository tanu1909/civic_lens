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
import AdminDashboard from "./pages/AdminDashboard";

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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full overflow-hidden">
        
        <Navbar user={user} />

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/map" element={<MapPage />} />

            {/* Auth Route: Redirect to Home if already logged in */}
            <Route
              path="/login"
              element={!user ? <AuthPage /> : <Navigate to="/" replace />}
            />

            {/* Protected Route: Redirect to Login if not logged in */}
            <Route
              path="/scan"
              element={
                user ? (
                  <CameraCapture user={user} />
                ) : (
                  <Navigate to="/login" state={{ from: "/scan" }} replace />
                )
              }
            />

            {/* User History */}
            <Route path="/history" element={<UserHistory />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
          </Routes>
        </main>

        <FooterCard />
      </div>
    </Router>
  );
};

export default App;