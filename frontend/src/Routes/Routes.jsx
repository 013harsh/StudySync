import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Registration from "../pages/Registration.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Account from "../pages/Account.jsx";
import Features from "../pages/Features.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/features" element={<Features />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
