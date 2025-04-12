import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Home from "./pages/Home/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VoterRegistration from "./pages/VoterRegistration";
import VoterDashboard from "./pages/VoterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Elections from "./pages/Elections";
import Results from "./pages/Results";
import VoterVerificationPage from "./pages/VoterVerificationPage";
import TwoFactorAuthPage from "./pages/TwoFactorAuthPage";
import Features from "./pages/Features";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="voter-registration" element={<VoterRegistration />} />
          <Route path="voter-verification" element={<VoterVerificationPage />} />
          <Route path="voter-dashboard" element={<VoterDashboard />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />
          <Route path="elections" element={<Elections />} />
          <Route path="results" element={<Results />} />
          <Route path="2fa" element={<TwoFactorAuthPage />} />
          <Route path="features" element={<Features />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;