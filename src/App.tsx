import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";

// Lazy-load every route — drops the initial JS bundle from ~1.3 MB to
// ~300 KB. Each route becomes its own async chunk and is fetched only
// when the user navigates to it.
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const NewClient = lazy(() => import("./pages/NewClient"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const NewCase = lazy(() => import("./pages/cases/NewCase"));
const CasesList = lazy(() => import("./pages/cases/CasesList"));
const CaseDetail = lazy(() => import("./pages/cases/CaseDetail"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Attachments = lazy(() => import("./pages/Attachments"));
const Requests = lazy(() => import("./pages/cases/Requests"));
const AvailableRequests = lazy(() => import("./pages/cases/AvailableRequests"));
const MyRequests = lazy(() => import("./pages/cases/MyRequests"));
const MyCases = lazy(() => import("./pages/cases/MyCases"));
const Appointments = lazy(() => import("./pages/Appointments"));
const CalendarPage = lazy(() => import("./pages/Calendar"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Reports = lazy(() => import("./pages/Reports"));
const Contracts = lazy(() => import("./pages/contracts/Contracts"));
const NewContract = lazy(() => import("./pages/contracts/NewContract"));
const Users = lazy(() => import("./pages/users/Users"));
const NewUser = lazy(() => import("./pages/users/NewUser"));
const Permissions = lazy(() => import("./pages/users/Permissions"));
const Admin = lazy(() => import("./pages/Admin"));
const Theme = lazy(() => import("./pages/Theme"));
const Profile = lazy(() => import("./pages/Profile"));
const DriveCallback = lazy(() => import("./pages/DriveCallback"));

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/oauth/drive/callback" element={<DriveCallback />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/new" element={<NewClient />} />
                <Route path="/clients/:id" element={<ClientProfile />} />
                <Route path="/clients/:id/edit" element={<NewClient />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/reports" element={<Reports />} />

                {/* Sessions */}
                <Route path="/sessions" element={<Sessions />} />

                {/* Attachments */}
                <Route path="/attachments" element={<Attachments />} />

                {/* Cases */}
                <Route path="/cases" element={<CasesList />} />
                <Route path="/cases/new" element={<NewCase />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/cases/:id/edit" element={<NewCase />} />
                <Route path="/cases/requests" element={<Requests />} />
                <Route path="/cases/available" element={<AvailableRequests />} />
                <Route path="/cases/my-requests" element={<MyRequests />} />
                <Route path="/cases/mine" element={<MyCases />} />

                {/* Contracts */}
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/contracts/new" element={<NewContract />} />

                {/* Users & Settings */}
                <Route path="/users" element={<Users />} />
                <Route path="/users/new" element={<NewUser />} />
                <Route path="/users/:id/edit" element={<NewUser />} />
                <Route path="/users/permissions" element={<Permissions />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/theme" element={<Theme />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
