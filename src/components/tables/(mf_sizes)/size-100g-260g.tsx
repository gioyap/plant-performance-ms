"use client";

import { createClient } from "@/src/utils/supabase/client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { FreshVolumeRow } from "@/src/lib/types";

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
    setData(updatedData);

    const { error } = await supabase
      .from("mf_raw_sizes")
      .update({ [field]: newValue })
      .eq("id", id);

    if (error) {
      console.error("Failed to update value:", error.message);
    }
  };

const handleExport = async () => {
  const { data, error } = await supabase
    .from("mf_raw_sizes")
    .select("date, abp, master_plan, actual_received, w_requirements, excess, advance_prod, safekeep, comp_to_master_plan, size")
    .eq("size", "100g-260g")
    .order("id", { ascending: true });

  if (error) {
    console.error("Export failed:", error.message);
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data || []);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, "100g-260g-volume.xlsx");
};

const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const bstr = evt.target?.result;
    if (!bstr || typeof bstr !== "string") return;

    const workbook = XLSX.read(bstr, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 0 });

    // Normalize header: lowercase all column names
    const normalizedExcel = excelData.map((row: any) => {
      const obj: any = {};
      for (const key in row) {
        obj[key.trim().toLowerCase()] = row[key];
      }
      return obj;
    });

    // Fetch existing rows only for size '100g-260g'
    const { data: existingRows, error } = await supabase
      .from("mf_raw_sizes")
      .select("id, date")
      .eq("size", "100g-260g");

    if (error) {
      console.error("Failed to fetch existing data:", error.message);
      return;
    }

    const updates = normalizedExcel.map((row) => {
      const match = existingRows?.find(
        (r) => r.date.toLowerCase() === row.date?.toLowerCase()
      );

      if (!match) return null;

      return {
        id: match.id,
        update: {
          abp: Number(row.abp) || 0,
          master_plan: Number(row.master_plan) || 0,
          actual_received: Number(row.actual_received) || 0,
          w_requirements: Number(row.w_requirements) || 0,
          excess: Number(row.excess) || 0,
          advance_prod: Number(row.advance_prod) || 0,
          safekeep: Number(row.safekeep) || 0,
          comp_to_master_plan: Number(row.comp_to_master_plan) || 0,
        },
      };
    }).filter(Boolean);

    for (const u of updates) {
      const { error } = await supabase
        .from("mf_raw_sizes")
        .update(u!.update)
        .eq("id", u!.id)
        .eq("size", "100g-260g"); // <- Ensure correct size match

      if (error) {
        console.error(`Failed to update row with id ${u!.id}:`, error.message);
      }
    }

    // Refresh data
    const refreshed = await supabase
      .from("mf_raw_sizes")
      .select("id, date, abp, master_plan, actual_received, w_requirements, excess, advance_prod, safekeep, comp_to_master_plan, size")
      .eq("size", "100g-260g")
      .order("id", { ascending: true });

    setData(refreshed.data as FreshVolumeRow[]);
  };

  reader.readAsBinaryString(file);
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
                <label htmlFor="excelUpload">
                  <DropdownMenuItem asChild>
                    <span>Import</span>
                  </DropdownMenuItem>
                  <input
                    type="file"
                    id="excelUpload"
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={handleImport}
                  />
                </label>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      <table className="min-w-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded">
       <thead>
        <tr className="bg-orange-500 text-white dark:bg-dark3 text-center">
          <th className="px-4 py-2 border">Date</th>
          <th className="px-4 py-2 border">ABP</th>
          <th className="px-4 py-2 border">Master Plan</th>
          <th className="px-4 py-2 border">Actual Received</th>
          <th className="px-4 py-2 border">W Requirements</th>
          <th className="px-4 py-2 border">Excess</th>
          <th className="px-4 py-2 border">Advance Prod</th>
          <th className="px-4 py-2 border">Safekeep</th>
          <th className="px-4 py-2 border">Comp to MPlan</th>
        </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="text-center">
              <td className="px-4 py-2 border">{row.date}</td>
              {(
                [
                  "abp",
                  "master_plan",
                  "actual_received",
                  "w_requirements",
                  "excess",
                  "advance_prod",
                  "safekeep",
                  "comp_to_master_plan",
                ] as const
              ).map((field) => (
                <td key={`${row.id}-${field}`} className="px-4 py-2 border">
                  <input
                    type="number"
                    defaultValue={row[field]}
                    onBlur={(e) => handleUpdate(row.id, field, e.target.value)}
                    className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
