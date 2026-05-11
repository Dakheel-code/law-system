import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Loader2, UserX, ArrowRight, UserPlus, Link as LinkIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

type Match = { id: string; email: string | null; fullName: string | null };

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "loading" | "found" | "missing" | "no-auth" | "linkable" | "linking"
  >("loading");
  const [linkable, setLinkable] = useState<Match | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lookup logic — runs on auth change
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
    let cancelled = false;

    (async () => {
      // 1) Find by auth_id (already linked)
      const byAuth = await supabase
        .from("staff")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (byAuth.data) {
        setStaffId(byAuth.data.id as string);
        setStatus("found");
        return;
      }

      // 2) Find by email (unlinked existing record)
      if (user.email) {
        const byEmail = await supabase
          .from("staff")
          .select("id, email, full_name, auth_id")
          .eq("email", user.email)
          .is("auth_id", null)
          .limit(1);
        if (cancelled) return;
        const candidate = byEmail.data?.[0];
        if (candidate) {
          setLinkable({
            id: candidate.id as string,
            email: candidate.email as string | null,
            fullName: candidate.full_name as string | null,
          });
          setStatus("linkable");
          return;
        }
      }

      setStatus("missing");
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const handleLink = async () => {
    if (!supabase || !user || !linkable) return;
    setStatus("linking");
    setError(null);
    const { error: err } = await supabase
      .from("staff")
      .update({ auth_id: user.id })
      .eq("id", linkable.id);
    if (err) {
      setError(err.message);
      setStatus("linkable");
      return;
    }
    setStaffId(linkable.id);
    setStatus("found");
  };

  if (status === "found" && staffId) {
    return <Navigate to={`/users/${staffId}/edit`} replace />;
  }

  if (status === "loading" || status === "linking") {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="mr-2 text-sm">
          {status === "linking" ? "جارٍ الربط..." : "جارٍ تحميل الملف الشخصي..."}
        </span>
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

  if (status === "linkable" && linkable) {
    return (
      <div className="card p-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
          <LinkIcon className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-1.5">
          وجدنا ملف موظف بنفس البريد
        </h3>
        <p className="text-sm text-slate-500 max-w-md mb-5 leading-7">
          هناك ملف موظف باسم{" "}
          <span className="font-bold text-slate-700">
            {linkable.fullName || "—"}
          </span>{" "}
          مرتبط بالبريد{" "}
          <bdi dir="ltr" className="font-mono text-slate-700">
            {linkable.email}
          </bdi>
          . اضغط أدناه لربطه بحسابك بدل إنشاء نسخة جديدة.
        </p>
        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={handleLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-bold shadow hover:bg-emerald-600"
          >
            <LinkIcon className="w-4 h-4" />
            ربط هذا الملف بحسابي
          </button>
          <Link
            to="/users/new?profile=1"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
          >
            <UserPlus className="w-4 h-4" />
            إنشاء ملف جديد بدلاً من ذلك
          </Link>
        </div>
      </div>
    );
  }

  // missing — no staff row linked or matchable
  return (
    <EmptyState
      title="لا يوجد ملف موظف مرتبط بحسابك"
      description={
        user?.email
          ? `حسابك (${user.email}) غير مرتبط بأي ملف موظف في النظام. أنشئ ملفك الآن وسيُربط تلقائياً.`
          : "حسابك غير مرتبط بأي ملف موظف في النظام."
      }
      actionTo="/users/new?profile=1"
      actionLabel="إنشاء ملف موظف وربطه بحسابي"
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
