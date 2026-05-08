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
import Budget from "./pages/finance/Budget";
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
          <Route path="/cases" element={<Placeholder title="إدارة القضايا" />} />
          <Route path="/cases/new" element={<NewCase />} />
          <Route path="/cases/requests" element={<Placeholder title="إدارة الطلبات" />} />
          <Route path="/cases/available" element={<Placeholder title="الطلبات المتاحة" />} />
          <Route path="/cases/my-requests" element={<Placeholder title="طلباتي" />} />
          <Route path="/cases/mine" element={<Placeholder title="قضاياي" />} />
          <Route path="/consultations" element={<Placeholder title="إدارة الاستشارات" />} />
          <Route path="/consultations/new" element={<NewConsultation />} />
          <Route path="/consultations/mine" element={<Placeholder title="استشاراتي" />} />
          <Route path="/consultations/available" element={<Placeholder title="الاستشارات المتاحة" />} />
          <Route path="/consultations/policy" element={<Placeholder title="سياسة الاستشارات" />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/contracts/new" element={<NewContract />} />
          <Route path="/marriage" element={<Placeholder title="توثيق عقد النكاح" />} />
          <Route path="/notary" element={<Placeholder title="كتابة العدل" />} />
          {/* Finance */}
          <Route path="/finance/budget" element={<Budget />} />
          <Route path="/finance/expenses" element={<Placeholder title="المصروفات والإيرادات" />} />
          <Route path="/finance/analysis" element={<Placeholder title="التحليل المالي" />} />
          <Route path="/finance/reports" element={<Placeholder title="التقارير المالية" />} />
          <Route path="/finance/treasury" element={<Placeholder title="الخزينة" />} />
          <Route path="/finance/salary-approval" element={<Placeholder title="اعتماد الرواتب" />} />
          <Route path="/finance/categories" element={<Placeholder title="التصنيفات المالية" />} />
          <Route path="/finance/tax" element={<Placeholder title="إعدادات الضريبة" />} />

          {/* Zakat */}
          <Route path="/zakat/declarations" element={<Placeholder title="إقرارات الزكاة" />} />
          <Route path="/zakat/vat" element={<Placeholder title="ضريبة القيمة المضافة" />} />
          <Route path="/zakat/e-invoicing" element={<Placeholder title="الفواتير الإلكترونية" />} />

          {/* HR - My Requests */}
          <Route path="/hr/my/leave" element={<Placeholder title="طلب إجازة" />} />
          <Route path="/hr/my/attendance" element={<Placeholder title="تسجيل حضوري" />} />
          <Route path="/hr/my/overtime" element={<Placeholder title="طلبات العمل الإضافي" />} />
          <Route path="/hr/my/permission" element={<Placeholder title="ساعات الاستئذان" />} />
          <Route path="/hr/my/delay" element={<Placeholder title="طلب تبرير التأخير" />} />

          {/* HR - Admin */}
          <Route path="/hr/admin/settings" element={<Placeholder title="إعدادات الموارد البشرية" />} />
          <Route path="/hr/admin/employees" element={<Placeholder title="إدارة الموظفين" />} />
          <Route path="/hr/admin/leaves" element={<Placeholder title="الإجازات" />} />
          <Route path="/hr/admin/attendance" element={<Placeholder title="الحضور والانصراف" />} />
          <Route path="/hr/admin/overtime" element={<Placeholder title="إدارة العمل الإضافي" />} />
          <Route path="/hr/admin/payroll" element={<Placeholder title="مسيرات الرواتب" />} />
          <Route path="/hr/admin/attendance-track" element={<Placeholder title="متابعة الحضور" />} />
          <Route path="/hr/admin/fingerprint" element={<Placeholder title="سجل بصمة اليد" />} />

          {/* HR - Reports */}
          <Route path="/hr/reports/center" element={<Placeholder title="مركز التقارير" />} />
          <Route path="/hr/reports/performance" element={<Placeholder title="تقييمات الأداء" />} />
          <Route path="/hr/reports/periodic" element={<Placeholder title="التقارير الدورية" />} />
          <Route path="/hr/reports/settings" element={<Placeholder title="إعدادات التقارير" />} />

          {/* HR - Approvals */}
          <Route path="/hr/approvals/leaves" element={<Placeholder title="اعتماد الإجازات" />} />
          <Route path="/hr/approvals/overtime" element={<Placeholder title="اعتماد العمل الإضافي" />} />
          <Route path="/hr/approvals/permission" element={<Placeholder title="اعتماد الاستئذان" />} />
          <Route path="/hr/approvals/delay" element={<Placeholder title="اعتماد تبريرات التأخير" />} />
          <Route path="/files" element={<Placeholder title="إدارة الملفات" />} />
          <Route path="/email" element={<Placeholder title="البريد الإلكتروني" />} />
          <Route path="/documents" element={<Placeholder title="خدمات وثائق" />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/new" element={<NewUser />} />
          <Route path="/users/permissions" element={<Permissions />} />
          <Route path="/admin" element={<Placeholder title="الإدارة" />} />
          <Route path="/theme" element={<Placeholder title="تخصيص الواجهة" />} />
          <Route path="/attendance" element={<Placeholder title="بصمة الحضور" />} />
        </Route>
      </Routes>
    </AuthProvider>
    </BrowserRouter>
  );
}
