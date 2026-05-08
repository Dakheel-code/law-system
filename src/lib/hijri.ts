const hijriDayFmt = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-arab", {
  day: "numeric",
});
const hijriFullFmt = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-arab", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const hijriMonthYearFmt = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
  month: "long",
  year: "numeric",
});
const hijriMonthFmt = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
  month: "long",
});

export const hijriDay = (d: Date) => hijriDayFmt.format(d);
export const hijriFull = (d: Date) => hijriFullFmt.format(d);
export const hijriMonthYear = (d: Date) => hijriMonthYearFmt.format(d);
export const hijriMonth = (d: Date) => hijriMonthFmt.format(d);

export const gregMonthYear = (d: Date) =>
  d.toLocaleDateString("ar-EG", { month: "long", year: "numeric" }) + " م";

export const gregFull = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function buildMonthGrid(reference: Date) {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const first = new Date(year, month, 1);
  // Saturday-first calendar: Sat=0, Sun=1, ..., Fri=6
  const dayMap = [1, 2, 3, 4, 5, 6, 0]; // JS Sun=0..Sat=6 → our index
  const startOffset = dayMap[first.getDay()];
  const start = new Date(year, month, 1 - startOffset);

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
