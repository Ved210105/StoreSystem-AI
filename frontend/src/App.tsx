import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import FloatingChatbot from './components/FloatingChatbot';
import NotificationList from './components/Notification';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';
import AdminOrders from './components/AdminOrders';
import AdminNotificationManager from './components/AdminNotificationManager';

function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return (
    <Router>
      <Navbar />
      <div className="min-h-[80vh] flex flex-col justify-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/notifications" element={user?.role === 'admin' ? <AdminNotificationManager /> : <NotificationList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <FloatingChatbot />
      <Footer />
    </Router>
  );
}

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-lg w-full text-center">
        <h2 className="text-3xl font-bold mb-4 text-red-700">404 - Not Found</h2>
        <p className="text-lg text-gray-600">Sorry, the page you are looking for does not exist.</p>
        <a href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Go Home</a>
      </div>
    </div>
  );
}

export default App;
