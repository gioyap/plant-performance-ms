import React from "react";
import { format, parseISO } from "date-fns";
import { EditableCellProps, MfRawSizeRow } from "@/src/lib/types";

export function formatPeriodDate(dateStr: string, period: string) {
  const date = parseISO(dateStr);
  if (period === "daily") return format(date, "MMM d");
  if (period === "weekly") return `W${format(date, "I")} (${format(date, "MMM d")})`;
  if (period === "monthly") return format(date, "MMM yyyy");
  return dateStr;
}

export const allFields = [
  "abp",
  "master_plan",
  "actual_received",
  "w_requirements",
  "excess", // non-editable
  "advance_prod",
  "safekeep",
  "comp_to_master_plan", // non-editable with %
] as const;

export const getDisplayFields = (period: string): Array<keyof MfRawSizeRow> => {
  if (period === "daily") return ["del_code", "qty", "wt", "size"];
  return ["qty", "wt", "size"];
};

const EditableCell: React.FC<EditableCellProps> = ({ value, onBlur, editable = true }) => {
  if (!editable) {
    return (
      <span className="block text-center">
        {typeof value === "number" ? Math.round(value) : value}
      </span>
    );
  }

  return (
    <input
      type="number"
      defaultValue={Math.round(value)}
      onBlur={(e) => onBlur(e.target.value)}
      className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  );
};

export default EditableCell;
