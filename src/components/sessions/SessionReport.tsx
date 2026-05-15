// Session Report — printable / PDF-exportable template for a single session.
//
// Auto-fills most fields from case + client + parties + assignments data.
// User fills only:
//   • الجلسة القادمة (text)  — uses existing session.nextAction + nextDate
//   • ملخص الجلسة     (text)  — uses existing session.minutes
//
// PDF export = window.print() with @media print CSS scoped to .session-report.
// Modern browsers offer "Save as PDF" in the print dialog — gives a clean
// PDF that matches the on-screen template exactly.

import { useMemo, useState } from "react";
import { FileText, Printer, Save, Loader2, Edit3 } from "lucide-react";
import type { CaseRecord } from "../../lib/caseStore";
import type { CaseSession } from "../../lib/caseStore";
import type { ClientRecord } from "../../lib/clientStore";
import type { UserRecord } from "../../lib/userStore";
import { useOffice } from "../../lib/officeStore";
import { updateSessionOnCase } from "../../lib/caseStore";
import { hijriFull, hijriMonthYear } from "../../lib/hijri";

const weekdayFmt = new Intl.DateTimeFormat("ar-SA", { weekday: "long" });
const arDay = (d: Date) => weekdayFmt.format(d);

type Props = {
  caseRec: CaseRecord;
  session: CaseSession;
  client: ClientRecord | null;
  users: UserRecord[];
};

export default function SessionReport({
  caseRec,
  session,
  client,
  users,
}: Props) {
  const { office } = useOffice();
  const [minutes, setMinutes] = useState(session.minutes ?? "");
  const [nextAction, setNextAction] = useState(session.nextAction ?? "");
  const [nextDate, setNextDate] = useState(session.nextDate ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // ----------------------------------------------------------------
  // Derive variables
  // ----------------------------------------------------------------

  const plaintiffParty = useMemo(() => {
    return (caseRec.parties ?? []).find((p) => p.role === "plaintiff");
  }, [caseRec.parties]);

  const defendantParty = useMemo(() => {
    return (caseRec.parties ?? []).find(
      (p) => p.role === "defendant" || p.role !== "plaintiff"
    );
  }, [caseRec.parties]);

  const plaintiffLawyer = useMemo(() => {
    // Pick primary lawyer first, fall back to first assignment
    const primary = caseRec.assignments?.find((a) => a.role === "primary");
    const fallback = caseRec.assignments?.[0];
    const id = primary?.userId ?? fallback?.userId;
    if (!id) return null;
    return users.find((u) => u.id === id) ?? null;
  }, [caseRec.assignments, users]);

  const clientName = client?.fullName || plaintiffParty?.name || "—";
  const opponentName =
    defendantParty?.name || caseRec.otherPartyName || "—";

  const caseNumber = caseRec.caseNumber || caseRec.code;
  const sessionDate = session.date ? new Date(session.date + "T00:00:00") : null;
  const sessionWeekday = sessionDate ? arDay(sessionDate) : "—";
  const sessionHijri = sessionDate ? hijriFull(sessionDate) : "—";
  const caseDate = caseRec.caseDate
    ? new Date(caseRec.caseDate + "T00:00:00")
    : null;
  // Hijri year of case (from caseDate or fallback to session)
  const caseHijriYear = (() => {
    const d = caseDate ?? sessionDate;
    if (!d) return "—";
    const formatted = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      year: "numeric",
    }).format(d);
    // Strip "هـ" if present
    return formatted.replace(/[^\d٠-٩]/g, "").trim();
  })();

  // Court + circuit prefer session-level then case-level
  const courtName = session.court || caseRec.courtType || "—";
  const circuitName = session.circuit || caseRec.circuitName || "—";

  // ----------------------------------------------------------------
  // Save edits back to the session
  // ----------------------------------------------------------------

  const dirty =
    minutes !== (session.minutes ?? "") ||
    nextAction !== (session.nextAction ?? "") ||
    nextDate !== (session.nextDate ?? "");

  const handleSave = async () => {
    setSaving(true);
    const ok = await updateSessionOnCase(caseRec.id, session.id, {
      minutes,
      nextAction,
      nextDate: nextDate || undefined,
    });
    setSaving(false);
    if (ok) setSavedAt(Date.now());
  };

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Editor controls — hidden during print */}
      <div className="print:hidden card p-5 space-y-4">
        <div className="flex items-center justify-between mb-1 pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {savedAt && !dirty && (
              <span className="text-xs text-emerald-600 font-bold">
                تم الحفظ ✓
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-bold disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              حفظ التعديلات
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-bold shadow"
            >
              <Printer className="w-4 h-4" />
              طباعة / حفظ PDF
            </button>
          </div>
          <h3 className="text-base font-extrabold text-slate-800 inline-flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-brand-500" />
            البيانات المتغيرة للتقرير
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
              موعد الجلسة القادمة (تاريخ + ساعة)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                dir="ltr"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
              الجلسة القادمة (نص مكمّل: الساعة، التفاصيل...)
            </span>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="مثال: الساعة 10:40 صباحاً"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </label>
        </div>

        <label className="block">
          <span className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
            ملخص الجلسة
          </span>
          <textarea
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="اكتب ما تم في الجلسة بأسلوب رسمي..."
            rows={5}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </label>
      </div>

      {/* Printable report */}
      <div className="session-report bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Report header */}
        <header className="report-header relative px-8 pt-8 pb-6 border-b-2 border-brand-500">
          <div className="flex items-start justify-between gap-4">
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
                {office?.officeName || "شركة المحاماة"}
              </h1>
              <p className="text-[11px] text-slate-500 mt-1">
                للمحاماة والاستشارات القانونية
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white shrink-0">
              <FileText className="w-7 h-7" strokeWidth={1.5} />
            </div>
          </div>
        </header>

        <main className="report-body px-8 py-6 text-slate-800 leading-7">
          {/* Greeting */}
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm font-bold">المحترمين</span>
            <h2 className="text-base font-extrabold">
              السادة | {clientName}
            </h2>
          </div>
          <p className="text-xs text-slate-600 text-right mb-4">
            السلام عليكم ورحمة الله وبركاته،،، وبعد
          </p>

          {/* Reference paragraph */}
          <p className="text-sm text-slate-700 leading-8 mb-5 text-right">
            إشارة إلى القضية المقامة منكم ضد{" "}
            <strong className="text-slate-900">{opponentName}</strong> بالرقم{" "}
            <strong className="text-slate-900" dir="ltr">
              ({caseNumber})
            </strong>{" "}
            لعام{" "}
            <strong className="text-slate-900" dir="ltr">
              {caseHijriYear}
            </strong>
            هـ{courtName !== "—" ? " ب" : ""}
            <strong className="text-slate-900">
              {courtName !== "—" ? courtName : ""}
            </strong>
            {circuitName !== "—" ? " والمنظورة لدى الدائرة " : ""}
            <strong className="text-slate-900">
              {circuitName !== "—" ? circuitName : ""}
            </strong>{" "}
            نفيدكم بالآتي:
          </p>

          {/* Case data table */}
          <section className="mb-5">
            <div className="bg-brand-50 px-3 py-1.5 inline-block rounded-t-md border-b-2 border-brand-500">
              <h3 className="text-sm font-extrabold text-brand-700">
                • بيانات القضية:
              </h3>
            </div>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 font-bold text-slate-700 w-32 align-top">
                    اليوم
                  </td>
                  <td className="py-2 px-3 text-slate-900">{sessionWeekday}</td>
                  <td
                    className="py-2 px-3 text-slate-900 text-left font-mono"
                    dir="ltr"
                  >
                    {sessionHijri}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 font-bold text-slate-700 align-top">
                    المدعية
                  </td>
                  <td className="py-2 px-3 text-slate-900">{clientName}</td>
                  <td className="py-2 px-3 text-slate-900">
                    <span className="font-bold text-slate-700">
                      المدعى عليها:
                    </span>{" "}
                    {opponentName}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 font-bold text-slate-700 align-top">
                    محامي المدعية
                  </td>
                  <td className="py-2 px-3 text-slate-900" colSpan={2}>
                    {plaintiffLawyer?.fullName || "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 font-bold text-slate-700 align-top">
                    المحكمة
                  </td>
                  <td className="py-2 px-3 text-slate-900">{courtName}</td>
                  <td className="py-2 px-3 text-slate-900">
                    <span className="font-bold text-slate-700">الدائرة:</span>{" "}
                    {circuitName}
                  </td>
                </tr>
                <tr className="bg-rose-50">
                  <td className="py-2 px-3 font-bold text-rose-700 align-top">
                    الجلسة القادمة
                  </td>
                  <td
                    className="py-2 px-3 text-rose-700 font-bold"
                    colSpan={2}
                  >
                    {nextDate ? (
                      <>
                        <span className="font-mono" dir="ltr">
                          {hijriMonthYear(new Date(nextDate + "T00:00:00"))}
                        </span>
                        {" "}
                        {nextAction}
                      </>
                    ) : (
                      nextAction || "—"
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Session summary */}
          <section className="mb-5">
            <div className="bg-brand-50 px-3 py-1.5 inline-block rounded-t-md border-b-2 border-brand-500">
              <h3 className="text-sm font-extrabold text-brand-700">
                • ملخص الجلسة:
              </h3>
            </div>
            <div className="border-b border-slate-200 py-3 px-3 text-sm text-slate-700 leading-7 whitespace-pre-wrap text-right">
              {minutes || (
                <span className="text-slate-400 italic">
                  لم يُكتب ملخص الجلسة بعد
                </span>
              )}
            </div>
          </section>

          {/* Sign-off */}
          <p className="text-sm font-bold text-slate-700 mt-4 mb-6">
            • للإحاطة والاطلاع وتقبلوا وافر الاحترام والتقدير.
          </p>

          {/* Signature block */}
          <div className="mt-10 pt-4 border-t border-slate-100 text-right">
            <h4 className="text-base font-extrabold text-slate-800">
              إدارة القضايا
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {office?.officeName || "شركة المحاماة"} للمحاماة والاستشارات
              القانونية
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="report-footer px-8 py-4 border-t-2 border-brand-500 bg-slate-50/50 flex items-end justify-between gap-4 text-[10px] text-slate-600">
          <div className="text-left" dir="ltr">
            {office?.website && (
              <div className="font-mono uppercase">{office.website}</div>
            )}
            {office?.phone && (
              <div className="font-mono mt-0.5">{office.phone}</div>
            )}
            {office?.email && (
              <div className="font-mono mt-0.5">{office.email}</div>
            )}
          </div>
          <div className="text-right">
            <div className="font-bold">
              {office?.officeName || "شركة المحاماة"}
            </div>
            {office?.crNumber && (
              <div className="mt-0.5">
                سجل تجاري: <bdi dir="ltr">{office.crNumber}</bdi>
              </div>
            )}
            {office?.taxNumber && (
              <div className="mt-0.5">
                الرقم الضريبي: <bdi dir="ltr">{office.taxNumber}</bdi>
              </div>
            )}
            {office?.address && <div className="mt-0.5">{office.address}</div>}
          </div>
        </footer>
      </div>

      {/* Print-only styles — scoped so the rest of the page hides during print */}
      <style>{`
        @media print {
          /* Page setup */
          @page {
            size: A4;
            margin: 12mm 12mm 14mm 12mm;
          }
          /* Hide everything except the report */
          body * { visibility: hidden; }
          .session-report,
          .session-report * { visibility: visible; }
          .session-report {
            position: absolute;
            inset: 0;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          /* Hide the editor controls + page chrome */
          .print\\:hidden { display: none !important; }
          /* Prevent inner table page-break inside rows */
          tr { page-break-inside: avoid; }
          /* Pure black text for legibility */
          .session-report { color: #0f172a !important; }
        }
      `}</style>
    </div>
  );
}
