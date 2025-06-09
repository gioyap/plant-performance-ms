import React from "react";

type EditableCellProps = {
  value: number;
  onBlur: (val: string) => void;
};

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

const EditableCell: React.FC<EditableCellProps> = ({ value, onBlur }) => {
  return (
    <td>
      <input
        type="number"
        defaultValue={Math.round(value)}
        onBlur={(e) => onBlur(e.target.value)}
        className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
    </td>
  );
};

export default EditableCell;
