import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import NewClient from "./pages/NewClient";
import ClientProfile from "./pages/ClientProfile";
import NewCase from "./pages/cases/NewCase";
import CasesList from "./pages/cases/CasesList";
import CaseDetail from "./pages/cases/CaseDetail";
import Sessions from "./pages/Sessions";
import Attachments from "./pages/Attachments";
import Requests from "./pages/cases/Requests";
import AvailableRequests from "./pages/cases/AvailableRequests";
import MyRequests from "./pages/cases/MyRequests";
import MyCases from "./pages/cases/MyCases";
import Appointments from "./pages/Appointments";
import CalendarPage from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Contracts from "./pages/contracts/Contracts";
import NewContract from "./pages/contracts/NewContract";
import Users from "./pages/users/Users";
import NewUser from "./pages/users/NewUser";
import Permissions from "./pages/users/Permissions";
import Admin from "./pages/Admin";
import Theme from "./pages/Theme";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
    <ThemeProvider>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
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
    </AuthProvider>
    </ThemeProvider>
    </BrowserRouter>
  );
}
