import { Landing } from "./components/Landing";
import { Interview } from "./components/Interview";
import { Result } from "./components/Result";
import { Dashboard } from "./components/Dashboard";
import { AuthCallback } from "./components/AuthCallback";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/interview/:interviewId" element={<Interview />} />
          <Route path="/result/:interviewId" element={<Result />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
        <Toaster position="bottom-left" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
