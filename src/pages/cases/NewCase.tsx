import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Stepper, { type Step } from "../../components/cases/Stepper";
import StepNav from "../../components/cases/StepNav";
import Step1Client from "../../components/cases/steps/Step1Client";
import Step2Details from "../../components/cases/steps/Step2Details";
import Step3Financial from "../../components/cases/steps/Step3Financial";
import Step5Duration from "../../components/cases/steps/Step5Duration";
import Step6Attachments from "../../components/cases/steps/Step6Attachments";
import { initialCase, type CaseFormState } from "../../components/cases/caseFormTypes";
import { addCase, getCase, updateCase } from "../../lib/caseStore";

const steps: Step[] = [
  { title: "معلومات العميل", description: "بيانات صاحب الطلب" },
  { title: "تفاصيل الطلب", description: "الطرف الآخر ونوع القضية" },
  { title: "المالية والمطالبة", description: "نوع المطالبة والمبالغ" },
  { title: "المدة والإدارة", description: "الأولوية والعقود" },
  { title: "المرفقات والملاحظات", description: "إتمام الطلب" },
];

export default function NewCase() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = Boolean(editId);
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState<CaseFormState>(initialCase);
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [notFound, setNotFound] = useState(false);

  // Load existing case in edit mode
  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      const c = await getCase(editId);
      if (cancelled) return;
      if (!c) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setData({
        clientId: c.clientId,
        clientRole: (c.clientRole as CaseFormState["clientRole"]) || "plaintiff",
        clientType: "individual",
        clientName: "",
        idType: "national",
        idNumber: "",
        phone: "",
        email: "",
        city: "",
        address: "",
        opponentRole: (c.opponentRole as CaseFormState["opponentRole"]) || "defendant",
        otherPartyName: c.otherPartyName,
        otherPartyId: c.otherPartyId,
        otherPartyPhone: c.otherPartyPhone,
        otherPartyAddress: c.otherPartyAddress,
        parties:
          c.parties && c.parties.length > 0
            ? (c.parties as CaseFormState["parties"])
            : c.otherPartyName
            ? [
                {
                  id: "legacy-1",
                  name: c.otherPartyName,
                  role: (c.opponentRole as "plaintiff" | "defendant") || "defendant",
                  idNumber: c.otherPartyId,
                  phone: c.otherPartyPhone,
                  address: c.otherPartyAddress,
                },
              ]
            : [],
        caseType: c.caseType,
        courtType: c.courtType,
        requestTitle: c.requestTitle,
        urgency: c.urgency,
        description: c.description,
        caseNumber: c.caseNumber,
        claimSubject: c.claimSubject,
        circuitName: c.circuitName,
        assignmentDate: c.assignmentDate ?? "",
        caseDate: c.caseDate ?? "",
        claimType: c.claimType,
        estimatedFees: c.estimatedFees,
        consultationFees: c.consultationFees,
        expectedCourtFees: c.expectedCourtFees,
        paymentStatus: c.paymentStatus,
        paymentMethod: c.paymentMethod,
        fees: (c.fees as CaseFormState["fees"]) ?? initialCase.fees,
        feesNotes: c.feesNotes,
        priority: c.priority,
        startDate: c.startDate ?? "",
        expectedEndDate: c.expectedEndDate ?? "",
        assignedLawyer: c.assignedLawyer ?? "",
        assignedLawyers: c.assignedLawyers ?? [],
        linkedContract: c.linkedContract,
        attachments: c.attachments ?? [],
        finalNotes: c.finalNotes,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const update = <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) =>
    setData((p) => ({ ...p, [key]: value }));

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const submit = async () => {
    if (isEditMode && editId) {
      const ok = await updateCase(editId, data);
      if (ok) navigate(`/cases/${editId}`);
    } else {
      const created = await addCase(data);
      if (created) navigate("/cases");
    }
  };

  const stepProps = { data, update };

  if (notFound) {
    return (
      <div className="card p-12 text-center">
        <h2 className="text-lg font-bold text-slate-700">القضية غير موجودة</h2>
        <p className="text-sm text-slate-500 mt-1">ربما تم حذفها أو الرابط غير صحيح.</p>
        <button
          onClick={() => navigate("/cases")}
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-bold hover:bg-brand-600"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="mr-2 text-sm">جارٍ تحميل القضية...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
      <div className="card p-6 space-y-6 order-2 lg:order-1">
        {isEditMode && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-800 text-right">
            وضع التعديل — أي تغييرات ستحدّث القضية الحالية.
          </div>
        )}
        {current === 0 && <Step1Client {...stepProps} />}
        {current === 1 && <Step2Details {...stepProps} />}
        {current === 2 && <Step3Financial {...stepProps} />}
        {current === 3 && <Step5Duration {...stepProps} />}
        {current === 4 && <Step6Attachments {...stepProps} />}

        <div className="border-t border-slate-100 pt-4">
          <StepNav
            current={current}
            total={steps.length}
            onPrev={prev}
            onNext={next}
            onSubmit={submit}
            submitLabel={isEditMode ? "حفظ التعديلات" : undefined}
          />
        </div>
      </div>

      <aside className="card p-4 sticky top-24 order-1 lg:order-2">
        <Stepper steps={steps} current={current} onJump={setCurrent} />
      </aside>
    </div>
  );
}
