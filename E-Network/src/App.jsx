import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Matches from './pages/Matches';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Header from './components/Header';
import Articles from './pages/Articles';

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setLoading(false);
    });

    return () => {
      listen();
    };
  }, []);

  const showHeader = authUser && !['/login', '/register', '/forgot-password'].includes(location.pathname);

  if (loading) {
    return <div className="loading-container">Loading...</div>; 
  }

  return (
    <div className="App">
      {showHeader && <Header />}
      <Routes>
        <Route 
          path="/login" 
          element={!authUser ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/register" 
          element={!authUser ? <Register /> : <Navigate to="/" />} 
        />
        <Route 
          path="/forgot-password" 
          element={!authUser ? <ForgotPassword /> : <Navigate to="/" />} 
        />
        <Route 
          path="/matches"
          element={authUser ? <Matches /> : <Navigate to="/login" />}
        />
        <Route 
          path="/profile"
          element={authUser ? <Profile /> : <Navigate to="/login" />}
        />
        <Route 
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login" />}
        />
        <Route 
          path="/articles"
          element={authUser ? <Articles /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;