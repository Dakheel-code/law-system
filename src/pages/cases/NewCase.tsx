import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Stepper, { type Step } from "../../components/cases/Stepper";
import StepNav from "../../components/cases/StepNav";
import Step1Client from "../../components/cases/steps/Step1Client";
import Step2Details from "../../components/cases/steps/Step2Details";
import Step3Financial from "../../components/cases/steps/Step3Financial";
import Step4Fees from "../../components/cases/steps/Step4Fees";
import Step5Duration from "../../components/cases/steps/Step5Duration";
import Step6Attachments from "../../components/cases/steps/Step6Attachments";
import { initialCase, type CaseFormState } from "../../components/cases/caseFormTypes";
import { addCase } from "../../lib/caseStore";

const steps: Step[] = [
  { title: "معلومات العميل", description: "بيانات صاحب الطلب" },
  { title: "تفاصيل الطلب", description: "الطرف الآخر ونوع القضية" },
  { title: "المالية والمطالبة", description: "نوع المطالبة والمبالغ" },
  { title: "أتعاب المحاماة", description: "تفاصيل الأتعاب" },
  { title: "المدة والإدارة", description: "الأولوية والعقود" },
  { title: "المرفقات والملاحظات", description: "إتمام الطلب" },
];

export default function NewCase() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState<CaseFormState>(initialCase);

  const update = <K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) =>
    setData((p) => ({ ...p, [key]: value }));

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const submit = async () => {
    const created = await addCase(data);
    if (created) navigate("/cases");
  };

  const stepProps = { data, update };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
      <div className="card p-6 space-y-6 order-2 lg:order-1">
        {current === 0 && <Step1Client {...stepProps} />}
        {current === 1 && <Step2Details {...stepProps} />}
        {current === 2 && <Step3Financial {...stepProps} />}
        {current === 3 && <Step4Fees {...stepProps} />}
        {current === 4 && <Step5Duration {...stepProps} />}
        {current === 5 && <Step6Attachments {...stepProps} />}

        <div className="border-t border-slate-100 pt-4">
          <StepNav
            current={current}
            total={steps.length}
            onPrev={prev}
            onNext={next}
            onSubmit={submit}
          />
        </div>
      </div>

      <aside className="card p-4 sticky top-24 order-1 lg:order-2">
        <Stepper steps={steps} current={current} onJump={setCurrent} />
      </aside>
    </div>
  );
}
