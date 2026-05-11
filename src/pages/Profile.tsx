import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Loader2, UserX, ArrowRight, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "missing" | "no-auth">(
    "loading"
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setStatus("no-auth");
      return;
    }
    if (!supabase) {
      setStatus("missing");
      return;
    }
    supabase
      .from("staff")
      .select("id")
      .eq("auth_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setStatus("missing");
          return;
        }
        setStaffId(data.id as string);
        setStatus("found");
      });
  }, [user, authLoading]);

  if (status === "found" && staffId) {
    return <Navigate to={`/users/${staffId}/edit`} replace />;
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="mr-2 text-sm">جارٍ تحميل الملف الشخصي...</span>
      </div>
    );
  }

  if (status === "no-auth") {
    return (
      <EmptyState
        title="لم يتم تسجيل الدخول"
        description="يجب تسجيل الدخول للوصول إلى ملفك الشخصي."
        actionTo="/login"
        actionLabel="تسجيل الدخول"
        actionIcon={ArrowRight}
      />
    );
  }

  // missing — no staff row linked to this auth user
  return (
    <EmptyState
      title="لا يوجد ملف موظف مرتبط بحسابك"
      description={
        user?.email
          ? `حسابك (${user.email}) غير مرتبط بأي ملف موظف في النظام. تواصل مع مدير المكتب لإضافة ملفك أو أنشئه الآن.`
          : "حسابك غير مرتبط بأي ملف موظف في النظام."
      }
      actionTo="/users/new"
      actionLabel="إنشاء ملف موظف"
      actionIcon={UserPlus}
    />
  );
}

function EmptyState({
  title,
  description,
  actionTo,
  actionLabel,
  actionIcon: ActionIcon,
}: {
  title: string;
  description: string;
  actionTo: string;
  actionLabel: string;
  actionIcon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="card p-10 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
        <UserX className="w-7 h-7 text-amber-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-5 leading-7">{description}</p>
      <Link
        to={actionTo}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold shadow hover:bg-brand-600"
      >
        <ActionIcon className="w-4 h-4" />
        {actionLabel}
      </Link>
    </div>
  );
}
