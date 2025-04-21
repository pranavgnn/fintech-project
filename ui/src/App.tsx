import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { lazy, Suspense } from "react";

// User pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AccountDetailPage = lazy(() => import("./pages/AccountDetailPage"));
const CreateAccountPage = lazy(() => import("./pages/CreateAccountPage"));
const TransferPage = lazy(() => import("./pages/TransferPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const UserDetailsPage = lazy(() => import("@/pages/UserDetailsPage"));
const UserAnalyticsPage = lazy(() => import("@/pages/UserAnalyticsPage"));
const AccountsPage = lazy(() => import("@/pages/AccountsPage"));
const AccountTransactionsPage = lazy(
  () => import("./pages/AccountTransactionsPage")
);

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOffersPage = lazy(() => import("./pages/admin/AdminOffersPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminAccountsPage = lazy(() => import("./pages/admin/AdminAccountsPage"));
const AdminTransactionsPage = lazy(
  () => import("./pages/admin/AdminTransactionsPage")
);
const OfferFormPage = lazy(() => import("@/pages/admin/OfferFormPage"));

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <LandingPage />
                </Suspense>
              }
            />
            <Route
              path="/login"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <LoginPage />
                </Suspense>
              }
            />
            <Route
              path="/signup"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <SignupPage />
                </Suspense>
              }
            />

            {/* Protected user routes */}
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            <Route
              path="/accounts/create"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ProtectedRoute>
                    <CreateAccountPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            <Route
              path="/accounts/:accountId"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ProtectedRoute>
                    <AccountDetailPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            <Route
              path="/accounts/:accountId/transactions"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ProtectedRoute>
                    <AccountTransactionsPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            <Route
              path="/transfer"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ProtectedRoute>
                    <TransferPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            <Route
              path="/profile"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ProtectedRoute>
                    <UserDetailsPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            <Route
              path="/analytics"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ProtectedRoute>
                    <UserAnalyticsPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            <Route
              path="/accounts"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ProtectedRoute>
                    <AccountsPage />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </Suspense>
              }
            />

            <Route
              path="/admin/offers"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminRoute>
                    <AdminOffersPage />
                  </AdminRoute>
                </Suspense>
              }
            />

            <Route
              path="/admin/users"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                </Suspense>
              }
            />

            <Route
              path="/admin/accounts"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminRoute>
                    <AdminAccountsPage />
                  </AdminRoute>
                </Suspense>
              }
            />

            <Route
              path="/admin/transactions"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminRoute>
                    <AdminTransactionsPage />
                  </AdminRoute>
                </Suspense>
              }
            />

            <Route
              path="/admin/users/:userId"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminRoute>
                    <UserDetailsPage />
                  </AdminRoute>
                </Suspense>
              }
            />

            <Route
              path="/admin/offers/create"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminRoute>
                    <OfferFormPage />
                  </AdminRoute>
                </Suspense>
              }
            />

            <Route
              path="/admin/offers/edit/:offerId"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminRoute>
                    <OfferFormPage />
                  </AdminRoute>
                </Suspense>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 Page */}
            <Route
              path="*"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <NotFoundPage />
                </Suspense>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
