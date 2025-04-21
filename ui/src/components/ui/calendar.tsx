"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// Interfaces
interface CalendarProps {
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | DateRange;
  onSelect?: (date: Date | null) => void;
  onRangeChange?: (range: DateRange) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
  fromDate?: Date;
  toDate?: Date;
}

interface DateRange {
  from: Date;
  to?: Date;
}

// Constants
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Calendar Component
export function Calendar({
  mode = "single",
  selected,
  onSelect,
  onRangeChange,
  className,
  disabled,
  fromDate,
  toDate,
}: CalendarProps) {
  const [currentView, setCurrentView] = React.useState<
    "days" | "months" | "years"
  >("days");
  const [focusedDate, setFocusedDate] = React.useState(
    selected instanceof Date ? selected : new Date()
  );
  const [currentDecade, setCurrentDecade] = React.useState(
    Math.floor(focusedDate.getFullYear() / 10) * 10
  );
  const [direction, setDirection] = React.useState<"left" | "right">("right");
  const [animateKey, setAnimateKey] = React.useState(0);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // const isToday = (date: Date) => {
  //   const today = new Date();
  //   return (
  //     date.getDate() === today.getDate() &&
  //     date.getMonth() === today.getMonth() &&
  //     date.getFullYear() === today.getFullYear()
  //   );
  // };

  const isSameDay = (a: Date, b: Date) => {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selected) return false;
    if (selected instanceof Date) return isSameDay(date, selected);
    if (Array.isArray(selected))
      return selected.some((d) => isSameDay(date, d));
    if (selected.from && isSameDay(date, selected.from)) return true;
    if (selected.to && isSameDay(date, selected.to)) return true;
    if (selected.from && selected.to) {
      return date > selected.from && date < selected.to;
    }
    return false;
  };

  const isDateDisabled = (date: Date) => {
    if (disabled && disabled(date)) return true;
    if (fromDate && date < fromDate) return true;
    if (toDate && date > toDate) return true;
    return false;
  };

  const handleDateClick = (date: Date, isOutsideMonth: boolean = false) => {
    if (isDateDisabled(date)) return;

    if (isOutsideMonth) {
      setDirection(
        date.getMonth() < focusedDate.getMonth() ||
          (date.getMonth() === 11 && focusedDate.getMonth() === 0)
          ? "left"
          : "right"
      );
      setFocusedDate(date);
      setAnimateKey((prev) => prev + 1);
      return;
    }

    if (mode === "single" && onSelect) {
      onSelect(date);
    } else if (mode === "range" && onRangeChange) {
      const range = selected as DateRange;

      if (!range || !range.from || range.to) {
        onRangeChange({ from: date });
      } else {
        if (date < range.from) {
          onRangeChange({ from: date, to: range.from });
        } else {
          onRangeChange({ ...range, to: date });
        }
      }
    }

    setFocusedDate(date);
  };

  const handleMonthChange = (change: number) => {
    setDirection(change < 0 ? "left" : "right");

    const newDate = new Date(focusedDate);
    newDate.setMonth(newDate.getMonth() + change);
    setFocusedDate(newDate);
    setAnimateKey((prev) => prev + 1);
  };

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(focusedDate);
    setDirection(month < focusedDate.getMonth() ? "left" : "right");
    newDate.setMonth(month);
    setFocusedDate(newDate);
    setCurrentView("days");
    setAnimateKey((prev) => prev + 1);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(focusedDate);
    setDirection(year < focusedDate.getFullYear() ? "left" : "right");
    newDate.setFullYear(year);
    setFocusedDate(newDate);
    setCurrentView("months");
    setAnimateKey((prev) => prev + 1);
  };

  const handleDecadeChange = (change: number) => {
    setDirection(change < 0 ? "left" : "right");
    setCurrentDecade(currentDecade + change * 10);
    setAnimateKey((prev) => prev + 1);
  };

  const toggleView = () => {
    if (currentView === "days") setCurrentView("months");
    else if (currentView === "months") setCurrentView("years");
    else setCurrentView("days");
  };

  const variants = {
    enter: (direction: string) => ({
      x: direction === "right" ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === "right" ? -100 : 100,
      opacity: 0,
    }),
  };

  const renderDaysView = () => {
    const year = focusedDate.getFullYear();
    const month = focusedDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      const day = daysInPrevMonth - firstDayOfMonth + i + 1;
      const date = new Date(prevMonthYear, prevMonth, day);
      const disabled = isDateDisabled(date);

      days.push(
        <Button
          key={`prev-${day}`}
          onClick={() => handleDateClick(date, true)}
          disabled={disabled}
          variant="ghost"
          className={cn(
            "h-9 w-9 p-0 font-normal text-muted-foreground opacity-50 hover:bg-accent hover:opacity-100",
            disabled && "opacity-25 cursor-not-allowed hover:bg-transparent"
          )}
        >
          {day}
        </Button>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const disabled = isDateDisabled(date);

      days.push(
        <Button
          key={`current-${day}`}
          onClick={() => handleDateClick(date)}
          disabled={disabled}
          variant="ghost"
          className={cn(isSelected(date) && "bg-foreground text-background")}
          // className={cn(
          //   "h-9 w-9 p-0 font-normal",
          //   isSelected(date) &&
          //     "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          //   !isSelected(date) &&
          //     isToday(date) &&
          //     "bg-accent text-accent-foreground",
          //   disabled && "opacity-50 cursor-not-allowed"
          // )}
        >
          {day}
        </Button>
      );
    }

    const daysNeeded = 42 - (firstDayOfMonth + daysInMonth);
    for (let day = 1; day <= daysNeeded; day++) {
      const date = new Date(nextMonthYear, nextMonth, day);
      const disabled = isDateDisabled(date);

      days.push(
        <Button
          key={`next-${day}`}
          onClick={() => handleDateClick(date, true)}
          disabled={disabled}
          variant="ghost"
          className={cn(
            "h-9 w-9 p-0 font-normal text-muted-foreground opacity-50 hover:bg-accent hover:opacity-100",
            disabled && "opacity-25 cursor-not-allowed hover:bg-transparent"
          )}
        >
          {day}
        </Button>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center px-1 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMonthChange(-1)}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            onClick={toggleView}
            className="text-sm font-medium"
          >
            {MONTHS[month]} {year}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMonthChange(1)}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-muted-foreground text-xs font-medium py-1"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </>
    );
  };

  const renderMonthsView = () => {
    const currentYear = focusedDate.getFullYear();

    return (
      <>
        <div className="flex justify-center items-center mb-4">
          <Button
            variant="ghost"
            onClick={toggleView}
            className="text-sm font-medium"
          >
            {currentYear}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1">
          {MONTHS.map((month, idx) => (
            <Button
              key={month}
              onClick={() => handleMonthSelect(idx)}
              variant="ghost"
              className={cn(
                "h-10 text-sm",
                focusedDate.getMonth() === idx &&
                  "bg-primary text-primary-foreground"
              )}
            >
              {month.substring(0, 3)}
            </Button>
          ))}
        </div>
      </>
    );
  };

  const renderYearsView = () => {
    const years = [];
    for (let year = currentDecade - 1; year <= currentDecade + 10; year++) {
      years.push(
        <Button
          key={year}
          onClick={() => handleYearSelect(year)}
          variant="ghost"
          className={cn(
            "h-10 text-sm",
            focusedDate.getFullYear() === year &&
              "bg-primary text-primary-foreground"
          )}
        >
          {year}
        </Button>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center px-1 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDecadeChange(-1)}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium">
            {currentDecade} - {currentDecade + 9}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDecadeChange(1)}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1">{years}</div>
      </>
    );
  };

  return (
    <div
      className={cn(
        "p-3 w-[286px] bg-card rounded-md border border-border shadow-sm",
        className
      )}
    >
      <div className="space-y-4 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {currentView === "days" && (
            <motion.div
              key={`days-${animateKey}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", duration: 0.25 }}
              className="overflow-hidden"
            >
              {renderDaysView()}
            </motion.div>
          )}

          {currentView === "months" && (
            <motion.div
              key={`months-${focusedDate.getFullYear()}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", duration: 0.25 }}
              className="overflow-hidden"
            >
              {renderMonthsView()}
            </motion.div>
          )}

          {currentView === "years" && (
            <motion.div
              key={`years-${currentDecade}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", duration: 0.25 }}
              className="overflow-hidden"
            >
              {renderYearsView()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";
