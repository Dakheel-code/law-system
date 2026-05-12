import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";

// When a new version is deployed, the user's open tab still references the
// previous hashed chunk file names (e.g. `Sessions-7i7yOt_v.js`). Those files
// no longer exist on Netlify, and the SPA fallback rewrites every unknown
// path to `/index.html` — so the browser receives HTML instead of JS and
// fails with "Failed to fetch dynamically imported module" → white screen.
//
// `retryLazy` catches that error and forces a one-time reload so the page
// re-fetches `index.html`, picks up the new chunk hashes, and recovers.
function retryLazy<T>(loader: () => Promise<T>): Promise<T> {
  return loader().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    const looksLikeChunkError =
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Loading chunk") ||
      msg.includes("Importing a module script failed") ||
      msg.includes("MIME type");
    const KEY = "__chunk_reload_attempted__";
    if (looksLikeChunkError && !sessionStorage.getItem(KEY)) {
      sessionStorage.setItem(KEY, "1");
      window.location.reload();
      // Block React from rendering the error boundary while we reload.
      return new Promise<T>(() => {});
    }
    throw err;
  });
}

// Lazy-load every route — drops the initial JS bundle and lets each route
// become its own async chunk fetched on demand.
const Login = lazy(() => retryLazy(() => import("./pages/Login")));
const Dashboard = lazy(() => retryLazy(() => import("./pages/Dashboard")));
const Clients = lazy(() => retryLazy(() => import("./pages/Clients")));
const NewClient = lazy(() => retryLazy(() => import("./pages/NewClient")));
const ClientProfile = lazy(() => retryLazy(() => import("./pages/ClientProfile")));
const NewCase = lazy(() => retryLazy(() => import("./pages/cases/NewCase")));
const CasesList = lazy(() => retryLazy(() => import("./pages/cases/CasesList")));
const CaseDetail = lazy(() => retryLazy(() => import("./pages/cases/CaseDetail")));
const Sessions = lazy(() => retryLazy(() => import("./pages/Sessions")));
const SessionDetail = lazy(() => retryLazy(() => import("./pages/SessionDetail")));
const Attachments = lazy(() => retryLazy(() => import("./pages/Attachments")));
const Requests = lazy(() => retryLazy(() => import("./pages/cases/Requests")));
const AvailableRequests = lazy(() =>
  retryLazy(() => import("./pages/cases/AvailableRequests"))
);
const MyRequests = lazy(() => retryLazy(() => import("./pages/cases/MyRequests")));
const MyCases = lazy(() => retryLazy(() => import("./pages/cases/MyCases")));
const Appointments = lazy(() => retryLazy(() => import("./pages/Appointments")));
const CalendarPage = lazy(() => retryLazy(() => import("./pages/Calendar")));
const Tasks = lazy(() => retryLazy(() => import("./pages/Tasks")));
const Reports = lazy(() => retryLazy(() => import("./pages/Reports")));
const Contracts = lazy(() => retryLazy(() => import("./pages/contracts/Contracts")));
const NewContract = lazy(() =>
  retryLazy(() => import("./pages/contracts/NewContract"))
);
const Users = lazy(() => retryLazy(() => import("./pages/users/Users")));
const NewUser = lazy(() => retryLazy(() => import("./pages/users/NewUser")));
const Permissions = lazy(() => retryLazy(() => import("./pages/users/Permissions")));
const Admin = lazy(() => retryLazy(() => import("./pages/Admin")));
const Theme = lazy(() => retryLazy(() => import("./pages/Theme")));
const Profile = lazy(() => retryLazy(() => import("./pages/Profile")));
const DriveCallback = lazy(() => retryLazy(() => import("./pages/DriveCallback")));

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
                <Route
                  path="/sessions/:caseId/:sessionId"
                  element={<SessionDetail />}
                />

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
