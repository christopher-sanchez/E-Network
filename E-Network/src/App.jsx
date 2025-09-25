import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Header from './components/Header';

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

  const showHeader = authUser && location.pathname !== '/login' && location.pathname !== '/register';

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
          path="/" 
          element={authUser ? <Home /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;
