import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
import Chat from './components/chat.jsx';

// Pages
import Home from './pages/home.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import RegisterSelection from './pages/register-selection.jsx';
import RegisterOrg from './pages/register-org.jsx';
import ForgotPassword from './pages/forgot-password.jsx';
import Profile from './pages/profile/index.jsx';
import Products from './pages/products.jsx';
import ProductDetail from './pages/product-detail.jsx';
import Admin from './pages/admin/index.jsx';
import Staff from './pages/staff/index.jsx';
import CreateListing from './pages/create-listing.jsx';
import PendingApproval from './pages/pending-approval.jsx';
import Cart from './pages/cart.jsx';
import MapPage from './pages/map.jsx';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) {
     if (user.role === 'admin') return <Navigate to="/admin" />;
     if (user.role === 'staff') return <Navigate to="/staff" />;
     return <Navigate to="/" />;
  }
  
  if (user && (user.role === 'organization' || user.role === 'org')) {
     if (user.status === 'pending' || user.status === 'rejected') {
        if (window.location.pathname !== '/pending-approval') {
           return <Navigate to="/pending-approval" />;
        }
     }
  }

  return children;
};

const Layout = ({ children, showHeader = true, showFooter = true, activePage = '' }) => {
  return (
    <>
      {showHeader && <Header activePage={activePage} />}
      {children}
      {showFooter && <Footer />}
      <Chat />
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout activePage="home"><Home /></Layout>} />
      
      <Route path="/login" element={<Layout showHeader={false} showFooter={false}><Login /></Layout>} />
      <Route path="/register" element={<Layout showHeader={false} showFooter={false}><RegisterSelection /></Layout>} />
      <Route path="/register-member" element={<Layout showHeader={false} showFooter={false}><Register /></Layout>} />
      <Route path="/register-organization" element={<Layout showHeader={false} showFooter={false}><RegisterOrg /></Layout>} />
      <Route path="/forgot-password" element={<Layout showHeader={false} showFooter={false}><ForgotPassword /></Layout>} />
      
      <Route path="/profile" element={<PrivateRoute><Layout activePage="profile"><Profile /></Layout></PrivateRoute>} />
      <Route path="/products" element={<Layout activePage="products"><Products /></Layout>} />
      <Route path="/product/:id" element={<Layout activePage="products"><ProductDetail /></Layout>} />
      <Route path="/map" element={<Layout activePage="map" showFooter={false}><MapPage /></Layout>} />
      
      <Route path="/cart" element={<PrivateRoute><Layout activePage="cart"><Cart /></Layout></PrivateRoute>} />
      <Route path="/create-listing" element={<PrivateRoute><Layout><CreateListing /></Layout></PrivateRoute>} />
      <Route path="/edit-listing" element={<PrivateRoute><Layout><CreateListing /></Layout></PrivateRoute>} />
      <Route path="/pending-approval" element={<PrivateRoute><Layout><PendingApproval /></Layout></PrivateRoute>} />
      
      <Route path="/admin/*" element={<PrivateRoute roles={['admin']}><Layout showHeader={false} showFooter={false}><Admin /></Layout></PrivateRoute>} />
      <Route path="/staff/*" element={<PrivateRoute roles={['staff', 'admin']}><Layout showHeader={false} showFooter={false}><Staff /></Layout></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
