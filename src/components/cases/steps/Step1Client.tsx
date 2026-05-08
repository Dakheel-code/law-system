import { Search, FileSearch } from "lucide-react";
import { Field, Input, Textarea } from "../../ui/Field";
import Select from "../../ui/Select";
import StepHeader from "../StepHeader";
import type { CaseFormState } from "../caseFormTypes";
import { cities, clientTypes, idTypes } from "../../../config/caseConfig";

type Props = {
  data: CaseFormState;
  update: <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) => void;
};

export default function Step1Client({ data, update }: Props) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="معلومات العميل"
        subtitle="أدخل بيانات العميل المتقدم بالطلب"
      />

      <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-4">
        <div className="flex items-center justify-end gap-2 mb-1">
          <h3 className="text-sm font-bold text-slate-700">البحث عن عميل</h3>
          <FileSearch className="w-4 h-4 text-violet-500" />
        </div>
        <p className="text-xs text-slate-500 mb-3 text-right">
          ابحث بالاسم، الهاتف، البريد، أو رقم الهوية
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-bold hover:bg-violet-600"
          >
            <Search className="w-4 h-4" />
            بحث
          </button>
          <input
            placeholder="اسم، هاتف، بريد، هوية..."
            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
      </div>

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
