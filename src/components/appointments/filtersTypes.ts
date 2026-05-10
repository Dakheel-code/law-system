export type AppointmentFilters = {
  search: string;
  lawyer: string; // "all" | user id
  status: string; // "all" | "pending" | "overdue" | "completed"
  period: string; // "all" | "today" | "week" | "month"
  type: string; // "all" | "task" | "case"
  dateScope: string; // "all" | "ended"
  view: string; // "table" | "calendar" | "timeline" | "cards"
};

export const defaultFilters: AppointmentFilters = {
  search: "",
  lawyer: "all",
  status: "all",
  period: "month",
  type: "all",
  dateScope: "all",
  view: "table",
};
