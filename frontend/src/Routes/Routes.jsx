import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Registration from "../pages/Registration.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Account from "../pages/Account.jsx";
import Features from "../pages/Features.jsx";
import Room from "../pages/Room.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import About from "../pages/About.jsx";
import Terms from "../pages/Terms.jsx";
import Privacy from "../pages/Privacy.jsx";
import Contact from "../pages/Contact.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/features" element={<ProtectedRoute><Features /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><Account /> </ProtectedRoute>} />
      <Route path="/room/:groupId" element={<ProtectedRoute><Room /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;
