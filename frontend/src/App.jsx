import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Mascot } from "page-mascot";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeToggle } from "./components/ThemeToggle";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StatsPage } from "./pages/StatsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeToggle />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <div className="page-mascot-wrap">
          <Mascot
            directions="/mascots/skater-directions.webp"
            reactions="/mascots/skater-reactions.webp"
            size={110}
            label="mascot cổ vũ giữ streak"
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
