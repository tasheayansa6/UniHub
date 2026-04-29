import React from "react";

const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CalendarDay = ({ day, isHeader }) => {
  const randomBgWhite =
    !isHeader && Math.random() < 0.3
      ? "bg-indigo-500 text-white"
      : "text-slate-500";

  return (
    <div
      className={`col-span-1 row-span-1 flex h-8 w-8 items-center justify-center ${
        isHeader ? "" : "rounded-xl"
      } ${randomBgWhite}`}
    >
      <span className={`font-medium ${isHeader ? "text-xs" : "text-sm"}`}>
        {day}
      </span>
    </div>
  );
};

export function CalendarCard({ bookingLink = "#" }) {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(
    currentYear,
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const renderCalendarDays = () => {
    let days = [
      ...dayNames.map((day, i) => (
        <CalendarDay key={`header-${day}`} day={day} isHeader />
      )),
      ...Array(firstDayOfWeek)
        .fill(null)
        .map((_, i) => (
          <div
            key={`empty-start-${i}`}
            className="col-span-1 row-span-1 h-8 w-8"
          />
        )),
      ...Array(daysInMonth)
        .fill(null)
        .map((_, i) => <CalendarDay key={`date-${i + 1}`} day={i + 1} />),
    ];
    return days;
  };

  return (
    <div
      className="group relative flex flex-col rounded-2xl border p-6 transition-all hover:shadow-lg"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      {/* Hover gradient */}
      <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-gradient-to-tl from-indigo-400/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-20 grid gap-5">
        <div>
          <h2 className="mb-4 text-lg md:text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
            Any questions about UniHub?
          </h2>
          <p className="mb-2 text-xs md:text-sm" style={{ color: "var(--muted-foreground)" }}>
            Feel free to reach out to the team!
          </p>
          <a
            href={bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-4 py-2 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "#3b82f6", color: "#fff" }}
          >
            Book Now
          </a>
        </div>

        <div className="transition-all duration-500">
          <div className="w-full max-w-md rounded-3xl border p-2 transition-colors duration-100 group-hover:border-indigo-400"
            style={{ borderColor: "var(--border)" }}>
            <div
              className="rounded-2xl border-2 p-3"
              style={{
                borderColor: "rgba(165, 174, 184, 0.1)",
                boxShadow: "0px 2px 1.5px 0px rgba(165, 174, 184, 0.32) inset",
                background: "var(--card)",
              }}
            >
              <div className="flex items-center space-x-2">
                <p className="text-sm" style={{ color: "var(--foreground)" }}>
                  <span className="font-medium">
                    {currentMonth}, {currentYear}
                  </span>
                </p>
                <span className="h-1 w-1 rounded-full bg-slate-400">&nbsp;</span>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  30 min call
                </p>
              </div>
              <div className="mt-4 grid grid-cols-7 grid-rows-5 gap-2 px-4">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arrow indicator */}
      {bookingLink && bookingLink !== "#" && (
        <div className="absolute bottom-4 right-6 z-30 flex h-12 w-12 rotate-6 items-center justify-center rounded-full bg-white opacity-0 transition-all duration-300 group-hover:translate-y-[-8px] group-hover:rotate-0 group-hover:opacity-100 shadow-lg">
          <svg
            className="h-6 w-6 text-indigo-600"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.25 15.25V6.75H8.75"
            />
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 7L6.75 17.25"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
