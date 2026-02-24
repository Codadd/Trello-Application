import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BoardProvider } from './context/BoardContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import BoardDetail from './pages/BoardDetail';

function AppContent() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/board/:boardId"
          element={
            <PrivateRoute>
              <BoardDetail />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <BoardProvider>
          <AppContent />
        </BoardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

