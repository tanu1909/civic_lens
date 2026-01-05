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
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/login"
              element={!user ? <AuthPage /> : <Navigate to="/" replace />}
            />

            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<Feedback />} />

            <Route
              path="/scan"
              element={
                user ? <CameraCapture user={user} /> : <Navigate to="/login" replace />
              }
            />

            <Route path="/history" element={<UserHistory />} />

            <Route path="/admin/feedback" element={<AdminFeedback />} />

            <Route
              path="/map"
              element={user ? <MapPage /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </main>

        <FooterCard />
      </div>
    </Router>
  );
};

export default App;
