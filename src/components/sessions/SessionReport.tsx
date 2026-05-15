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
import { Printer, Save, Loader2, Edit3 } from "lucide-react";
import type { CaseRecord } from "../../lib/caseStore";
import type { CaseSession } from "../../lib/caseStore";
import type { ClientRecord } from "../../lib/clientStore";
import type { UserRecord } from "../../lib/userStore";
import { useOffice } from "../../lib/officeStore";
import { updateSessionOnCase } from "../../lib/caseStore";
import { hijriFull } from "../../lib/hijri";

const weekdayFmt = new Intl.DateTimeFormat("ar-SA", { weekday: "long" });
const arDay = (d: Date) => weekdayFmt.format(d);

/**
 * Convert a numeric circuit identifier to its Arabic ordinal feminine form.
 * Example: "13" → "الثالثة عشر"
 * If the input is already Arabic text (e.g. "الدائرة التجارية الأولى"),
 * it's returned as-is.
 */
function circuitOrdinal(raw: string): string {
  const clean = raw.trim();
  if (!clean) return "—";
  // If it's not a pure number, return as-is
  if (!/^\d+$/.test(clean)) return clean;
  const n = parseInt(clean, 10);
  const ones: Record<number, string> = {
    1: "الأولى",
    2: "الثانية",
    3: "الثالثة",
    4: "الرابعة",
    5: "الخامسة",
    6: "السادسة",
    7: "السابعة",
    8: "الثامنة",
    9: "التاسعة",
    10: "العاشرة",
  };
  const teens: Record<number, string> = {
    11: "الحادية عشر",
    12: "الثانية عشر",
    13: "الثالثة عشر",
    14: "الرابعة عشر",
    15: "الخامسة عشر",
    16: "السادسة عشر",
    17: "السابعة عشر",
    18: "الثامنة عشر",
    19: "التاسعة عشر",
  };
  if (n >= 1 && n <= 10) return ones[n];
  if (n >= 11 && n <= 19) return teens[n];
  if (n === 20) return "العشرون";
  // Fallback for larger numbers — keep numeric
  return clean;
}

/**
 * Extract HH:MM from a free-text `nextAction` value (back-compat with old
 * records that stored "10:40 صباحاً" or similar). Returns "" if no match.
 */
function extractTime(s: string): string {
  const m = s.trim().match(/(\d{1,2}):(\d{2})/);
  if (!m) return "";
  const h = Math.max(0, Math.min(23, parseInt(m[1], 10)));
  const mm = Math.max(0, Math.min(59, parseInt(m[2], 10)));
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Format HH:MM (24h) as "HH:MM صباحاً" or "HH:MM مساءً" (12h with AM/PM). */
function formatTimeArabic(time: string): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time;
  const isMorning = h < 12;
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${
    isMorning ? "صباحاً" : "مساءً"
  }`;
}

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
  // Time of the upcoming session. Stored inside `nextAction` for back-compat;
  // we extract HH:MM from any existing free-text and reformat on save.
  const [nextTime, setNextTime] = useState(
    extractTime(session.nextAction ?? "")
  );
  const [nextDate, setNextDate] = useState(session.nextDate ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // ----------------------------------------------------------------
  // Derive variables
  // ----------------------------------------------------------------

  // Whether our client is the plaintiff or defendant in this case.
  // Drives the wording of role labels throughout the report.
  const isClientPlaintiff = caseRec.clientRole === "plaintiff";
  const clientRoleLabel = isClientPlaintiff ? "المدعي" : "المدعى عليه";
  const opponentRoleLabel = isClientPlaintiff ? "المدعى عليه" : "المدعي";
  const lawyerRoleLabel = `محامي ${clientRoleLabel}`;

  const plaintiffParty = useMemo(
    () => (caseRec.parties ?? []).find((p) => p.role === "plaintiff"),
    [caseRec.parties]
  );

  const defendantParty = useMemo(
    () =>
      (caseRec.parties ?? []).find(
        (p) => p.role === "defendant" || p.role !== "plaintiff"
      ),
    [caseRec.parties]
  );

  const caseLawyer = useMemo(() => {
    // Pick primary lawyer first, fall back to first assignment
    const primary = caseRec.assignments?.find((a) => a.role === "primary");
    const fallback = caseRec.assignments?.[0];
    const id = primary?.userId ?? fallback?.userId;
    if (!id) return null;
    return users.find((u) => u.id === id) ?? null;
  }, [caseRec.assignments, users]);

  // Resolve client name and opponent name based on client's role.
  const clientName =
    client?.fullName ||
    (isClientPlaintiff ? plaintiffParty?.name : defendantParty?.name) ||
    "—";
  const opponentName =
    (isClientPlaintiff ? defendantParty?.name : plaintiffParty?.name) ||
    caseRec.otherPartyName ||
    "—";

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

  // Save time formatted as "HH:MM صباحاً/مساءً" so it shows nicely if read
  // back into older UIs.
  const nextActionToSave = nextTime ? formatTimeArabic(nextTime) : "";

  const dirty =
    minutes !== (session.minutes ?? "") ||
    nextActionToSave !== (session.nextAction ?? "") ||
    nextDate !== (session.nextDate ?? "");

  const handleSave = async () => {
    setSaving(true);
    const ok = await updateSessionOnCase(caseRec.id, session.id, {
      minutes,
      nextAction: nextActionToSave,
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
              تاريخ الجلسة القادمة
            </span>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              dir="ltr"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-500 mb-1.5 text-right">
              ساعة الجلسة القادمة
            </span>
            <input
              type="time"
              value={nextTime}
              onChange={(e) => setNextTime(e.target.value)}
              dir="ltr"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left font-mono focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            {nextTime && (
              <span className="block text-[10px] text-emerald-700 font-bold mt-1 text-right">
                ↳ ستظهر كـ: <bdi dir="rtl">{formatTimeArabic(nextTime)}</bdi>
              </span>
            )}
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
        {/* Report header — logo top-left, no company name text */}
        <header className="report-header relative px-8 pt-8 pb-6 border-b-2 border-brand-500">
          <div className="flex items-start justify-between gap-4">
            {/* Right side intentionally blank to keep the layout clean.
                The logo carries the brand identity. */}
            <div className="flex-1" />
            <img
              src="https://nasserlaw.org/wp-content/uploads/2024/06/footerlogo.png"
              alt={office?.officeName || "شعار المكتب"}
              className="h-20 object-contain shrink-0"
              loading="eager"
              crossOrigin="anonymous"
            />
          </div>
        </header>

        <main className="report-body px-8 py-6 text-slate-800 leading-7">
          {/* Greeting — client name + "المحترمين" grouped together on the right */}
          <div className="text-right mb-2">
            <h2 className="text-base font-extrabold inline">
              السادة | {clientName}
            </h2>
            <span className="text-sm font-bold mr-2">المحترمين</span>
          </div>
          <p className="text-xs text-slate-600 text-right mb-4">
            السلام عليكم ورحمة الله وبركاته،،، وبعد
          </p>

          {/* Reference paragraph — wording flips based on client role */}
          <p className="text-sm text-slate-700 leading-8 mb-5 text-right">
            إشارة إلى القضية{" "}
            {isClientPlaintiff ? (
              <>
                المقامة منكم ضد{" "}
                <strong className="text-slate-900">{opponentName}</strong>
              </>
            ) : (
              <>
                المقامة ضدكم من{" "}
                <strong className="text-slate-900">{opponentName}</strong>
              </>
            )}{" "}
            بالرقم{" "}
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
              {circuitName !== "—" ? circuitOrdinal(circuitName) : ""}
            </strong>{" "}
            نفيدكم بالآتي:
          </p>

          {/* Case data table — 4-column layout: label | value | label | value */}
          <section className="mb-5">
            <div className="bg-brand-50 px-3 py-1.5 inline-block rounded-t-md border-b-2 border-brand-500">
              <h3 className="text-sm font-extrabold text-brand-700">
                • بيانات القضية:
              </h3>
            </div>
            <table className="w-full text-sm border-collapse table-fixed">
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "30%" }} />
              </colgroup>
              <tbody>
                {/* Row 1: اليوم */}
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 px-3 font-bold text-slate-700 bg-slate-50/60 align-middle">
                    اليوم
                  </td>
                  <td className="py-2.5 px-3 text-slate-900">
                    {sessionWeekday}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700 bg-slate-50/60 align-middle">
                    التاريخ
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-mono text-sm">
                    <bdi dir="rtl">{sessionHijri}</bdi>
                  </td>
                </tr>

                {/* Row 2: العميل + الخصم */}
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 px-3 font-bold text-slate-700 bg-slate-50/60 align-middle">
                    {clientRoleLabel}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-bold">
                    {clientName}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700 bg-slate-50/60 align-middle">
                    {opponentRoleLabel}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-bold">
                    {opponentName}
                  </td>
                </tr>

                {/* Row 3: المحامي (spans value cols) */}
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 px-3 font-bold text-slate-700 bg-slate-50/60 align-middle">
                    {lawyerRoleLabel}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900" colSpan={3}>
                    {caseLawyer?.fullName || "—"}
                  </td>
                </tr>

                {/* Row 4: المحكمة + الدائرة */}
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 px-3 font-bold text-slate-700 bg-slate-50/60 align-middle">
                    المحكمة
                  </td>
                  <td className="py-2.5 px-3 text-slate-900">{courtName}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-700 bg-slate-50/60 align-middle">
                    الدائرة
                  </td>
                  <td className="py-2.5 px-3 text-slate-900">
                    {circuitOrdinal(circuitName)}
                  </td>
                </tr>

                {/* Row 5: الجلسة القادمة (spans value cols, red highlight) */}
                <tr className="bg-rose-50">
                  <td className="py-2.5 px-3 font-extrabold text-rose-700 bg-rose-100/60 align-middle">
                    الجلسة القادمة
                  </td>
                  <td
                    className="py-2.5 px-3 text-rose-700 font-extrabold whitespace-nowrap"
                    colSpan={3}
                  >
                    {nextDate || nextTime ? (
                      <span className="inline-flex items-center gap-2 flex-wrap">
                        {nextDate && (
                          <bdi dir="rtl">
                            {hijriFull(new Date(nextDate + "T00:00:00"))}
                          </bdi>
                        )}
                        {nextDate && nextTime && (
                          <span className="opacity-70">ـ</span>
                        )}
                        {nextTime && (
                          <bdi dir="rtl">
                            الساعة {formatTimeArabic(nextTime)}
                          </bdi>
                        )}
                      </span>
                    ) : (
                      "—"
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
