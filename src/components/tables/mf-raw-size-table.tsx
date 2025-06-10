"use client";

import { useEffect, useState } from "react";
import { SkeletonLoading } from "@/src/components/core/loading";
import { createClient } from "@/src/utils/supabase/client";
import { MfRawSizeRow, MfRawSizeTableProps } from "@/src/lib/types";
import { formatPeriodDate } from "@/src/components/core/editablecell";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import EditableCell, { allFields } from "../core/editablecell";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export default function MfRawSizeTable({ size, period, year }: MfRawSizeTableProps) {
  const [data, setData] = useState<MfRawSizeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { data, error } = await supabase
        .from("mf_raw_sizes")
        .select("*")
        .eq("period_type", period)
        .eq("period_year", year)
        .eq("size", size)
        .order("period_date", { ascending: true });

      if (error) {
        console.error("Error fetching:", error);
        setData([]);
      } else {
        setData(data ?? []);
      }

      setLoading(false);
    }

    fetchData();
  }, [size, period, year]);

  if (loading) return <SkeletonLoading />;

  if (data.length === 0) {
    return (
      <div className="text-center text-dark4 py-4">
        No data for <strong>{size}</strong> in <strong>{period}</strong> ({year}).
      </div>
    );
  }

  const handleUpdate = async (
    id: number,
    field: keyof MfRawSizeRow,
    value: string
  ) => {
    const newValue = Number(value);
  
    const updatedData = data.map((row) => {
      if (row.id !== id) return row;
  
      const updatedRow = { ...row, [field]: newValue };
  
      // ⬇ Calculate excess
      const excess =
        updatedRow.actual_received > updatedRow.master_plan
          ? Math.round(updatedRow.actual_received - updatedRow.master_plan)
          : 0;
  
      // ⬇ Calculate % compliance to master plan
      const comp_to_master_plan =
        updatedRow.master_plan > 0
          ? Math.round((updatedRow.actual_received / updatedRow.master_plan) * 100)
          : 0;
  
      return {
        ...updatedRow,
        excess,
        comp_to_master_plan,
      };
    });
  
    const changedRow = updatedData.find((r) => r.id === id)!;
  
    setData(updatedData);
    toast.success("Updated complete!");
  
    const { error } = await supabase
      .from("mf_raw_sizes")
      .update({
        [field]: newValue,
        excess: changedRow.excess,
        comp_to_master_plan: changedRow.comp_to_master_plan,
      })
      .eq("id", id);
  
    if (error) {
      toast.error("Failed to update value");
    }
  };
  
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "100g-below");
    XLSX.writeFile(workbook, "100g-below.xlsx");
  };
  
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: MfRawSizeRow[] = XLSX.utils.sheet_to_json(worksheet);
  
      await Promise.all(
        jsonData.map(async (row) => {
          const { id, size: _, ...rest } = row;
          if (!id) return null;
  
          const excess =
            row.actual_received > row.master_plan
              ? row.actual_received - row.master_plan
              : 0;
  
          const comp_to_master_plan =
            row.master_plan > 0
              ? Math.round((row.actual_received / row.master_plan) * 100)
              : 0;
  
          const { error } = await supabase
            .from("mf_raw_sizes")
            .upsert(   {
                  id,
                  size: "100g-below",
                  ...rest,
                  excess,
                  comp_to_master_plan,
                }, { onConflict: "id" });
          if (error) {
            console.error(`Failed to import row id ${id}:`, error.message);
            toast.error(`Import failed at row id ${id}`);
          }
  
          return row;
        })
      );
  
      toast.success("Import successful");
      setData(jsonData);
    };
  
    reader.readAsArrayBuffer(file);
  };

  return (
    <Card className="p-4 w-full overflow-x-auto">
       <div className="flex justify-between items-center mb-4">
          <p className="text-xs italic text-gray-500 dark:text-gray-400 font-semibold">100g-260g</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 ml-20">
              <DropdownMenuLabel>Table Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleExport}>Export</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <FileInputWrapper>
                    <label htmlFor="excelUpload" className="w-full pl-2 relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-dark2">
                      Import
                    </label>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      id="excelUpload"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </FileInputWrapper>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
       <table className="w-full border text-center border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded overflow-x-auto">
        <thead>
        <tr className="bg-orange-500 text-white dark:bg-dark3 w-full lg:text-nowrap">
            <th>date</th>
            {allFields.map((field) => (
              <th key={field} className="border px-8">{field.replace(/_/g, " ")}</th>
            ))}
        </tr>
        </thead>
        <tbody>
            {data.map((row) => (
              <tr key={`${row.period_date}-${row.size}`} className=" w-full lg:text-nowrap ">
                <td className=" px-4 border">{formatPeriodDate(row.period_date, period)}</td>
                {allFields.map((field) => (
                  <td key={`${row.period_date}-${row.size}-${field}`} className="px-4 py-2 border">
                    {field === "excess" || field === "comp_to_master_plan" ? (
                      <span className="">
                        {field === "comp_to_master_plan" ? `${row[field]}%` : row[field]}
                      </span>
                    ) : (
                       <EditableCell
                          key={`${row.id}-${field}`}
                          value={row[field]}
                          onBlur={(val) => handleUpdate(row.id, field, val)}
                        />
                     )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
      </table>
    </Card>
  );
}
const FileInputWrapper = ({ children }: { children: React.ReactNode }) => {
  return <span>{children}</span>;
};
