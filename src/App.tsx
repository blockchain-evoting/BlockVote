import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Home from "./pages/Home/Home";
import LoginPage from "./pages/LoginPage";
import ServerDiscovery from "./components/ServerDiscovery";
import RegisterPage from "./pages/RegisterPage";
import VoterRegistration from "./pages/VoterRegistration";
import VoterDashboard from "./pages/VoterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Elections from "./pages/Elections";
import Results from "./pages/Results";
import VoterVerificationPage from "./pages/VoterVerificationPage";
import TwoFactorAuthPage from "./pages/TwoFactorAuthPage";
import Features from "./pages/Features";
import ElectionCreationPage from "./pages/ElectionCreationPage";
import ElectionManagementPage from "./pages/ElectionManagementPage";
import ElectionEditPage from "./pages/ElectionEditPage";
import ElectionDetailsPage from "./pages/ElectionDetailsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import CastVotePage from "./pages/CastVotePage";
import VoteConfirmationPage from "./pages/VoteConfirmationPage";

function App() {
  return (
    <Router>
      {/* Server discovery component to automatically detect API server port */}
      <ServerDiscovery />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="voter-registration" element={<VoterRegistration />} />
          <Route path="voter-verification" element={<VoterVerificationPage />} />
          <Route path="voter-dashboard" element={<VoterDashboard />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />
          <Route path="admin/elections" element={<ElectionManagementPage />} />
          <Route path="admin/elections/new" element={<ElectionCreationPage />} />
          <Route path="admin/elections/edit/:id" element={<ElectionEditPage />} />
          <Route path="elections" element={<Elections />} />
          <Route path="elections/:id" element={<ElectionDetailsPage />} />
          <Route path="cast-vote/:id" element={<CastVotePage />} />
          <Route path="vote-confirmation" element={<VoteConfirmationPage />} />
          <Route path="results" element={<Results />} />
          <Route path="2fa" element={<TwoFactorAuthPage />} />
          <Route path="features" element={<Features />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;