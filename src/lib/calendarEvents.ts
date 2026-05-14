import { useMemo } from "react";
import { useTasks } from "./taskStore";
import { useCases } from "./caseStore";
import { useContracts } from "./contractStore";

export type CalendarEventType =
  | "task"
  | "case-start"
  | "case-end"
  | "session"
  | "contract-start"
  | "contract-end";

export type CalendarEvent = {
  id: string;
  type: CalendarEventType;
  title: string;
  date: string; // YYYY-MM-DD
  color: string; // tailwind bg-class root (without -500 suffix), e.g. "violet"
  meta?: string;
  /** Optional list of user IDs (used for task assignees). */
  assigneeIds?: string[];
};

const colorMap: Record<CalendarEventType, string> = {
  task: "violet",
  "case-start": "sky",
  "case-end": "amber",
  session: "emerald",
  "contract-start": "emerald",
  "contract-end": "rose",
};

const labelMap: Record<CalendarEventType, string> = {
  task: "مهمة",
  "case-start": "بداية قضية",
  "case-end": "انتهاء قضية",
  session: "جلسة",
  "contract-start": "بداية عقد",
  "contract-end": "انتهاء عقد",
};

export function eventTypeLabel(t: CalendarEventType) {
  return labelMap[t];
}

export function useCalendarEvents() {
  const { tasks } = useTasks();
  const { cases } = useCases();
  const { contracts } = useContracts();

  return useMemo(() => {
    const events: CalendarEvent[] = [];

    tasks.forEach((t) => {
      if (!t.dueDate || t.archived) return;
      events.push({
        id: `task-${t.id}`,
        type: "task",
        title: t.title,
        date: t.dueDate,
        color: colorMap.task,
        meta: t.priority,
        assigneeIds: Array.isArray(t.assignees) ? t.assignees : [],
      });
    });

    cases.forEach((c) => {
      if (c.startDate) {
        events.push({
          id: `case-start-${c.id}`,
          type: "case-start",
          title: c.requestTitle || c.code,
          date: c.startDate,
          color: colorMap["case-start"],
          meta: c.code,
        });
      }
      if (c.expectedEndDate) {
        events.push({
          id: `case-end-${c.id}`,
          type: "case-end",
          title: `انتهاء: ${c.requestTitle || c.code}`,
          date: c.expectedEndDate,
          color: colorMap["case-end"],
          meta: c.code,
        });
      }
      // Sessions — each one becomes a calendar event
      (c.sessions ?? []).forEach((s) => {
        if (!s.date) return;
        const timePrefix = s.time ? `${s.time} · ` : "";
        const modeLabel = s.mode === "online" ? "أون لاين" : "حضوري";
        events.push({
          id: `session-${c.id}-${s.id}`,
          type: "session",
          title: `${timePrefix}جلسة (${modeLabel}): ${c.requestTitle || c.code}`,
          date: s.date,
          color: colorMap.session,
          meta: c.code,
        });
      });
    });

    contracts.forEach((c) => {
      if (c.startDate) {
        events.push({
          id: `contract-start-${c.id}`,
          type: "contract-start",
          title: c.title,
          date: c.startDate,
          color: colorMap["contract-start"],
          meta: c.code,
        });
      }
      if (c.endDate) {
        events.push({
          id: `contract-end-${c.id}`,
          type: "contract-end",
          title: `انتهاء: ${c.title}`,
          date: c.endDate,
          color: colorMap["contract-end"],
          meta: c.code,
        });
      }
    });

    // Group by date (YYYY-MM-DD)
    const byDate = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const arr = byDate.get(e.date) ?? [];
      arr.push(e);
      byDate.set(e.date, arr);
    });

    return { events, byDate };
  }, [tasks, cases, contracts]);
}
