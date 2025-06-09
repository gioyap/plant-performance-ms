import React from "react";

type EditableCellProps = {
  value: number;
  onBlur: (val: string) => void;
};

export const beforeExcessFields = ["abp", "master_plan", "actual_received", "w_requirements"] as const;
export const afterExcessFields = ["advance_prod", "safekeep"] as const;

const EditableCell: React.FC<EditableCellProps> = ({ value, onBlur }) => {
  return (
    <td className="border">
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
