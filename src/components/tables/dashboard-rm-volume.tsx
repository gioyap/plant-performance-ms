"use client";

import { createClient } from "@/src/utils/supabase/client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import * as XLSX from "xlsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { RMVolumeRow } from "@/src/lib/types";

export default function DashboardRMVolumeTable() {
  const supabase = createClient();
  const [data, setData] = useState<RMVolumeRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("dashboard-rm-volume")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Failed to fetch chart data:", error.message);
      } else {
        setData(data as RMVolumeRow[]);
      }
    };

    fetchData();
  }, [supabase]);

  const handleUpdate = async (
    id: number,
    field: keyof RMVolumeRow,
    value: string
  ) => {
    const newValue = Number(value);
    const updatedData = data.map((row) =>
      row.id === id ? { ...row, [field]: newValue } : row
    );
    setData(updatedData);

    const { error } = await supabase
      .from("dashboard-rm-volume")
      .update({ [field]: newValue })
      .eq("id", id);

    if (error) {
      console.error("Failed to update value:", error.message);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DashboardRMVolume");
    XLSX.writeFile(wb, "dashboard-rm-volume.xlsx");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const importedData: RMVolumeRow[] = XLSX.utils.sheet_to_json(ws);

      for (const row of importedData) {
        const { error } = await supabase
          .from("dashboard-rm-volume")
          .upsert(row, { onConflict: "id" }); // update if ID exists
        if (error) {
          console.error("Import error:", error.message);
        }
      }

      // Optional: refresh the local data
      const { data, error } = await supabase.from("dashboard-rm-volume").select("*").order("id");
      if (!error) setData(data as RMVolumeRow[]);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Card className="p-4 w-full overflow-x-auto">
     <div className="mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 ml-20">
            <DropdownMenuLabel>Table Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleExport}>Export</DropdownMenuItem>
              <label htmlFor="excelUpload">
                <DropdownMenuItem asChild>
                  <span>Import</span>
                </DropdownMenuItem>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleImport}
                  className="hidden"
                  id="excelUpload"
                />
              </label>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <table className="min-w-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded overflow-x-auto">
        <thead>
          <tr className=" bg-orange-500 text-white dark:bg-dark3 text-center">
            <th className="px-4 py-2 border">ABP</th>
            <th className="px-4 py-2 border">Total RM</th>
            <th className="px-4 py-2 border">Last ABP</th>
            <th className="px-4 py-2 border">Last Total RM</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="text-center">
              {(["abp", "totalrm", "lastabp", "lasttotalrm"] as const).map(
                (field) => (
                  <td key={field} className="px-4 py-2 border">
                    <input
                      type="number"
                      defaultValue={row[field]}
                      onBlur={(e) =>
                        handleUpdate(row.id, field, e.target.value)
                      }
                      className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
