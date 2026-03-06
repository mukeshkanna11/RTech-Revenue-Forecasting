import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "../components/layout/ProtectedRoute";

/* ================================
   Lazy Loaded Pages
================================ */

const Login = lazy(() => import("../modules/auth/pages/Login"));
const Register = lazy(() => import("../modules/auth/pages/Register"));

const Dashboard = lazy(() =>
  import("../modules/dashboard/pages/Dashboard")
);

const Revenues = lazy(() =>
  import("../modules/revenue/pages/Revenues")
);

const Targets = lazy(() =>
  import("../modules/target/pages/Targets")
);

const Forecast = lazy(() =>
  import("../modules/forecast/pages/Forecast")
);

const Clients = lazy(() =>
  import("../modules/clients/pages/Clients")
);

const Invoices = lazy(() =>
  import("../modules/invoices/pages/InvoicePage")
);

const Health = lazy(() =>
  import("../modules/health/pages/Health")
);

/* ================================
   Loader
================================ */

const Loader = () => (
  <div className="flex items-center justify-center h-screen text-lg">
    Loading...
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/revenues"
          element={
            <ProtectedRoute>
              <Revenues />
            </ProtectedRoute>
          }
        />

        <Route
          path="/targets"
          element={
            <ProtectedRoute>
              <Targets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/forecast"
          element={
            <ProtectedRoute>
              <Forecast />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />

        <Route
          path="/health"
          element={
            <ProtectedRoute>
              <Health />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen text-2xl font-bold">
              404 - Page Not Found
            </div>
          }
        />

      </Routes>
    </Suspense>
  );
}