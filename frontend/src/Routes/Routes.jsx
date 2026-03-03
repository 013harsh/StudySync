import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Registration from "../pages/Registration.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Account from "../pages/Account.jsx";
import Features from "../pages/Features.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/account" element={<Account />} />
      <Route path="/features" element={<Features />} />
    </Routes>
  );
};

export default AppRoutes;
