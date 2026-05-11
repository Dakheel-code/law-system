import { useEffect, useMemo, useState } from "react";
import {
  FileSearch,
  Search,
  UserPlus,
  X,
  Check,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { Field, Input, Textarea } from "../../ui/Field";
import Select from "../../ui/Select";
import StepHeader from "../StepHeader";
import type { CaseFormState } from "../caseFormTypes";
import { cities, clientTypes, idTypes } from "../../../config/caseConfig";
import { useClients, addClient } from "../../../lib/clientStore";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step1Client({ data, update }: Props) {
  const { clients } = useClients();
  const [searchInput, setSearchInput] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Live filter: as user types, narrow the results
  const matches = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return [];
    return clients
      .filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.idNumber.includes(q) ||
          c.code.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [clients, searchInput]);

  const selectedClient = data.clientId
    ? clients.find((c) => c.id === data.clientId)
    : null;

  // If a clientId is set externally and we have its record loaded, ensure form
  // fields remain in sync (don't clobber user edits — only sync once on link)
  useEffect(() => {
    if (!selectedClient) return;
    // Run only when the linked client first becomes available
  }, [selectedClient]);

  const pickClient = (id: string) => {
    const c = clients.find((x) => x.id === id);
    if (!c) return;
    update("clientId", c.id);
    update("clientType", c.clientType || "individual");
    update("clientName", c.fullName);
    update("idNumber", c.idNumber);
    update("phone", c.phone);
    update("email", c.email);
    setSearchInput("");
  };

  const unlinkClient = () => {
    update("clientId", null);
    update("clientName", "");
    update("idNumber", "");
    update("phone", "");
    update("email", "");
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="معلومات العميل"
        subtitle="أدخل بيانات العميل المتقدم بالطلب"
      />

      {/* Search / create card */}
      <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-violet-600 border border-violet-200 rounded-lg text-xs font-bold hover:bg-violet-100"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {showCreate ? "إلغاء" : "عميل جديد"}
          </button>
          <div className="flex items-center justify-start gap-2">
            <h3 className="text-sm font-bold text-slate-700">البحث عن عميل</h3>
            <FileSearch className="w-4 h-4 text-violet-500" />
          </div>
        </div>

        {selectedClient ? (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <button
              type="button"
              onClick={unlinkClient}
              className="p-1 rounded-md hover:bg-emerald-100 text-emerald-700"
              title="إلغاء الربط"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <div className="text-sm font-bold text-emerald-800 flex items-center justify-start gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {selectedClient.fullName}
              </div>
              <div className="text-[11px] text-emerald-700/80 mt-0.5">
                <bdi dir="ltr">{selectedClient.code}</bdi>
                {selectedClient.phone && (
                  <>
                    {" "}
                    · <bdi dir="ltr">{selectedClient.phone}</bdi>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 text-right">
              ابحث بالاسم، الهاتف، البريد، أو رقم الهوية — تلقائياً أثناء الكتابة
            </p>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="اسم، هاتف، بريد، هوية..."
                className="w-full pr-9 pl-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </div>
            {searchInput.trim() && (
              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                {matches.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-slate-400 text-center">
                    لا يوجد عملاء مطابقون.{" "}
                    <button
                      type="button"
                      onClick={() => setShowCreate(true)}
                      className="text-violet-600 hover:text-violet-700 font-bold"
                    >
                      أضف عميلاً جديداً
                    </button>
                  </div>
                ) : (
                  <ul className="max-h-56 overflow-y-auto">
                    {matches.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => pickClient(c.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-violet-50 border-b border-slate-100 last:border-b-0 text-right"
                        >
                          <ChevronRight />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-700 truncate">
                              {c.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 justify-end">
                              {c.phone && (
                                <bdi dir="ltr" className="font-mono">
                                  {c.phone}
                                </bdi>
                              )}
                              {c.idNumber && (
                                <bdi dir="ltr">{c.idNumber}</bdi>
                              )}
                              <span className="font-mono text-slate-400" dir="ltr">
                                {c.code}
                              </span>
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                            <UserIcon className="w-3.5 h-3.5 text-brand-600" />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {showCreate && (
          <InlineNewClient
            initial={{
              fullName: data.clientName,
              phone: data.phone,
              email: data.email,
              idNumber: data.idNumber,
              clientType: data.clientType,
            }}
            saving={creating}
            onCancel={() => setShowCreate(false)}
            onCreate={async (payload) => {
              setCreating(true);
              const created = await addClient({
                clientType: payload.clientType,
                contractType: "default",
                firstName: "",
                secondName: "",
                thirdName: "",
                lastName: "",
                fullName: payload.fullName,
                idNumber: payload.idNumber,
                nationality: "",
                email: payload.email,
                phone: payload.phone,
                attachments: [],
                notes: "",
              });
              setCreating(false);
              if (created) {
                update("clientId", created.id);
                update("clientType", created.clientType);
                update("clientName", created.fullName);
                update("idNumber", created.idNumber);
                update("phone", created.phone);
                update("email", created.email);
                setShowCreate(false);
                setSearchInput("");
              }
            }}
          />
        )}
      </div>

      {/* Client fields (editable; if linked, edits stay local to the case form) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="نوع العميل *">
          <Select
            options={clientTypes}
            value={data.clientType}
            onChange={(e) => update("clientType", e.target.value)}
          />
        </Field>
        <Field label="اسم العميل *">
          <Input
            placeholder="الاسم الكامل"
            value={data.clientName}
            onChange={(e) => update("clientName", e.target.value)}
          />
        </Field>

        <Field label="نوع الهوية">
          <Select
            options={idTypes}
            value={data.idType}
            onChange={(e) => update("idType", e.target.value)}
          />
        </Field>
        <Field label="رقم الهوية">
          <Input
            placeholder="رقم الهوية"
            value={data.idNumber}
            onChange={(e) => update("idNumber", e.target.value)}
          />
        </Field>

        <Field label="رقم الجوال">
          <Input
            placeholder="05xxxxxxxx"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
            dir="ltr"
            className="text-left"
          />
        </Field>
        <Field label="البريد الإلكتروني">
          <Input
            type="email"
            placeholder="example@email.com"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            dir="ltr"
            className="text-left"
          />
        </Field>

        <Field label="المدينة">
          <Select
            options={cities}
            value={data.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="المدينة"
          />
        </Field>
      </div>

      <Field label="العنوان">
        <Textarea
          placeholder="العنوان التفصيلي"
          rows={3}
          value={data.address}
          onChange={(e) => update("address", e.target.value)}
        />
      </Field>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg
      className="w-3.5 h-3.5 text-slate-300 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function InlineNewClient({
  initial,
  saving,
  onCancel,
  onCreate,
}: {
  initial: {
    fullName: string;
    phone: string;
    email: string;
    idNumber: string;
    clientType: string;
  };
  saving: boolean;
  onCancel: () => void;
  onCreate: (p: {
    fullName: string;
    phone: string;
    email: string;
    idNumber: string;
    clientType: string;
  }) => Promise<void>;
}) {
  const [fullName, setFullName] = useState(initial.fullName);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [idNumber, setIdNumber] = useState(initial.idNumber);
  const [clientType, setClientType] = useState(initial.clientType || "individual");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!fullName.trim()) {
      setError("أدخل اسم العميل");
      return;
    }
    setError(null);
    await onCreate({ fullName, phone, email, idNumber, clientType });
  };

  return (
    <div className="bg-white rounded-lg border border-violet-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded hover:bg-slate-100 text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
        <h4 className="text-sm font-bold text-violet-700 flex items-center justify-start gap-1.5">
          <UserPlus className="w-4 h-4" />
          إنشاء عميل جديد
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="نوع العميل">
          <Select
            options={clientTypes}
            value={clientType}
            onChange={(e) => setClientType(e.target.value)}
          />
        </Field>
        <Field label="الاسم الكامل *">
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="الاسم الكامل"
          />
        </Field>
        <Field label="رقم الجوال">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xxxxxxxx"
            dir="ltr"
            className="text-left"
          />
        </Field>
        <Field label="رقم الهوية">
          <Input
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="رقم الهوية"
            dir="ltr"
            className="text-left"
          />
        </Field>
        <Field label="البريد">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            dir="ltr"
            className="text-left"
            type="email"
          />
        </Field>
      </div>
      {error && (
        <div className="text-xs text-rose-700 text-right">{error}</div>
      )}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-md"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-violet-500 text-white text-xs font-bold rounded-md shadow hover:bg-violet-600 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UserPlus className="w-3.5 h-3.5" />
          )}
          {saving ? "جارٍ الإنشاء..." : "إنشاء وربط"}
        </button>
      </div>
    </div>
  );
}
