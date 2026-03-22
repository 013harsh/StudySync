import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Registration from "../pages/Registration.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Account from "../pages/Account.jsx";
import Features from "../pages/Features.jsx";
import Room from "../pages/Room.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import About from "../pages/footer/About.jsx";
import Terms from "../pages/footer/Terms.jsx";
import Privacy from "../pages/footer/Privacy.jsx";
import Contact from "../pages/footer/Contact.jsx";
import Hero from "../components/Hero.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/Home" element={<Home />} />
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
