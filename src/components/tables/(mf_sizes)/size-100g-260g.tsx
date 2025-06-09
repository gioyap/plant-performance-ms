"use client";

import { createClient } from "@/src/utils/supabase/client";
import React, { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { FreshVolumeRow } from "@/src/lib/types";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import EditableCell, { afterExcessFields, beforeExcessFields } from "../../core/editablecell";

export default function Size100g260gPage() {
  const supabase = createClient();
  const [data, setData] = useState<FreshVolumeRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("mf_raw_sizes")
        .select("id, date, abp, master_plan, actual_received, w_requirements, excess, advance_prod, safekeep, comp_to_master_plan, size")
        .eq("size", "100g-260g")
        .order("id", { ascending: true });

      if (error) {
        console.error("Failed to fetch chart data:", error.message);
      } else {
        setData(data as FreshVolumeRow[]);
      }
    };

    fetchData();
  }, [supabase]);

  const handleUpdate = async (
    id: number,
    field: keyof FreshVolumeRow,
    value: string
  ) => {
    const newValue = Number(value);
    const updatedData = data.map((row) =>
      row.id === id ? { ...row, [field]: newValue } : row
    );
    toast.success("Updated Complete!")
    setData(updatedData);

    const { error } = await supabase
      .from("mf_raw_sizes")
      .update({ [field]: newValue })
      .eq("id", id);

      if (error) {
      toast.error("Failed to update value");
    }
  };

const handleExport = () => {
  const worksheet = XLSX.utils.json_to_sheet(data || []);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "100g-260g");
  XLSX.writeFile(workbook, "100g-260g.xlsx");
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
    const jsonData: FreshVolumeRow[] = XLSX.utils.sheet_to_json(worksheet);

    await Promise.all(
      jsonData.map(async (row) => {
        const { id, size: _, ...rest } = row;
        if (!id) return null;

        const { error } = await supabase
          .from("mf_raw_sizes")
          .upsert({ id, size: "100g-260g", ...rest }, { onConflict: "id" });

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
      <table className="min-w-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded overflow-x-auto">
       <thead>
        <tr className="bg-orange-500 text-white dark:bg-dark3 text-center">
          <th className="px-4 py-2 border">Date</th>
          <th className="px-4 py-2 border">ABP</th>
          <th className="px-4 py-2 border">Master Plan</th>
          <th className="px-4 py-2 border">Actual Received</th>
          <th className="px-4 py-2 border">W Requirements</th>
          <th className="px-8 py-2 border">Excess</th>
          <th className="px-4 py-2 border">Advance Prod</th>
          <th className="px-4 py-2 border">Safekeep</th>
          <th className="px-8 py-2 border">Comp to MPlan</th>
        </tr>
        </thead>
          <tbody>
            {data.map((row:any) => (
              <tr key={row.id} className="text-center">
                <td className="px-4 py-2 border">{row.date}</td>

                {/* Before Excess */}
                {beforeExcessFields.map((field) => (
                  <EditableCell
                    key={`${row.id}-${field}`}
                    value={row[field]}
                    onBlur={(val) => handleUpdate(row.id, field, val)}
                  />
                ))}
                {/* Excess Column */}
                <td className="border">
                  {Math.round(
                    row.actual_received > row.master_plan
                      ? row.actual_received - row.master_plan
                      : 0
                  )}
                </td>
                {/* After Excess */}
                {afterExcessFields.map((field) => (
                  <EditableCell
                    key={`${row.id}-${field}`}
                    value={row[field]}
                    onBlur={(val) => handleUpdate(row.id, field, val)}
                  />
                ))}
                {/* /* Comp to Master Plan - calculated percentage */}
                <td className="border">
                  {row.master_plan > 0
                    ? `${Math.round((row.actual_received / row.master_plan) * 100)}%`
                    : "0%"}
                </td>
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
