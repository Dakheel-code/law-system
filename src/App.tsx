import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import NewClient from "./pages/NewClient";
import NewCase from "./pages/cases/NewCase";
import Appointments from "./pages/Appointments";
import CalendarPage from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import NewConsultation from "./pages/consultations/NewConsultation";
import Contracts from "./pages/contracts/Contracts";
import NewContract from "./pages/contracts/NewContract";
import Users from "./pages/users/Users";
import NewUser from "./pages/users/NewUser";
import Permissions from "./pages/users/Permissions";

function Placeholder({ title }: { title: string }) {
  return (
    <div className="card p-10 text-center text-slate-400">
      <h2 className="text-xl font-bold text-slate-700 mb-2">{title}</h2>
      <p className="text-sm">قيد التطوير — سيتم بناء هذه الصفحة في مرحلة لاحقة</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/reports" element={<Reports />} />

          {/* Cases */}
          <Route path="/cases" element={<Placeholder title="إدارة القضايا" />} />
          <Route path="/cases/new" element={<NewCase />} />
          <Route path="/cases/requests" element={<Placeholder title="إدارة الطلبات" />} />
          <Route path="/cases/available" element={<Placeholder title="الطلبات المتاحة" />} />
          <Route path="/cases/my-requests" element={<Placeholder title="طلباتي" />} />
          <Route path="/cases/mine" element={<Placeholder title="قضاياي" />} />

          {/* Consultations */}
          <Route path="/consultations" element={<Placeholder title="إدارة الاستشارات" />} />
          <Route path="/consultations/new" element={<NewConsultation />} />
          <Route path="/consultations/mine" element={<Placeholder title="استشاراتي" />} />
          <Route path="/consultations/available" element={<Placeholder title="الاستشارات المتاحة" />} />
          <Route path="/consultations/policy" element={<Placeholder title="سياسة الاستشارات" />} />

          {/* Contracts */}
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/contracts/new" element={<NewContract />} />

          {/* Users & Settings */}
          <Route path="/users" element={<Users />} />
          <Route path="/users/new" element={<NewUser />} />
          <Route path="/users/permissions" element={<Permissions />} />
          <Route path="/admin" element={<Placeholder title="الإدارة" />} />
          <Route path="/theme" element={<Placeholder title="تخصيص الواجهة" />} />
        </Route>
      </Routes>
    </AuthProvider>
    </BrowserRouter>
  );
}
