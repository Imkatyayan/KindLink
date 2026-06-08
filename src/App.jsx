import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import { AdminRoute, UserRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AdminPanel from './pages/AdminPanel';
import CreatePost from './pages/CreatePost';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Matches from './pages/Matches';
import Messages from './pages/Messages';
import PostDetail from './pages/PostDetail';
import Posts from './pages/Posts';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import './styles/global.css';

function AppRoutes() {
  const location = useLocation();

  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
        <Route path="/posts/create" element={<UserRoute><CreatePost /></UserRoute>} />
        <Route path="/matches" element={<UserRoute><Matches /></UserRoute>} />
        <Route path="/messages" element={<UserRoute><Messages /></UserRoute>} />
        <Route path="/transactions" element={<UserRoute><Transactions /></UserRoute>} />
        <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <BrowserRouter>
              <div className="app-layout">
                <div className="app-bg" />
                <Navbar />
                <main className="main-content">
                  <AppRoutes />
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
