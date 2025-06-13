"use client";

import { useEffect, useState } from "react";
import { SkeletonLoading } from "@/src/components/core/loading";
import { createClient } from "@/src/utils/supabase/client";
import { MfRawSizeRow, MfRawSizeTableProps } from "@/src/lib/types";
import { formatPeriodDate, getDisplayFields } from "@/src/components/core/editablecell";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
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
        .from("mf_rm_volume")
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
  
const handleExport = () => {
  if (!data || data.length === 0) {
    toast.error("No data to export.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, size);

  // Use the first row's period_year for the filename
  const year = data[0]?.period_year ?? new Date().getFullYear();

  const filename = `${size}_${period}_${year}.xlsx`;
  XLSX.writeFile(workbook, filename);
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
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    // Only include fields for this period
    const displayFields = getDisplayFields(period);

    const cleanedRows: MfRawSizeRow[] = jsonData
      .filter((row) => row.id && row.period_date)
      .map((row) => {
        const parsedRow: Partial<MfRawSizeRow> = {
          id: row.id,
          period_date: row.period_date,
          size, // use current tab's size
        };

        for (const field of displayFields) {
          if (field !== "size") {
            parsedRow[field] = row[field];
          }
        }

        return parsedRow as MfRawSizeRow;
      });

    const { error } = await supabase
      .from("mf_rm_volume")
      .upsert(cleanedRows, { onConflict: "id" });

    if (error) {
      console.error("Import failed:", error.message);
      toast.error("Import failed");
    } else {
      toast.success("Import successful");
      setData(cleanedRows);
    }
  };

  reader.readAsArrayBuffer(file);
};

  return (
 <Card className="p-4 w-full overflow-x-auto">
    <div className="flex justify-between items-center mb-4">
      <p className="text-xs italic text-gray-500 dark:text-gray-400 font-semibold">
        {period.toUpperCase()} - {size}
      </p>
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
                      Import </label>
                    <input type="file" accept=".xlsx, .xls" id="excelUpload" onChange={handleImport} className="hidden"
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
          <th className="px-8 border">Date</th>
          {getDisplayFields(period).map((field: keyof MfRawSizeRow) => (
            <th key={field} className="border px-8">{field.replace(/_/g, " ")}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={`${row.period_date}-${row.size}`} className="w-full lg:text-nowrap">
            <td className="px-4 py-2 border">{formatPeriodDate(row.period_date, period)}</td>
              {getDisplayFields(period).map((field: keyof MfRawSizeRow) => (
                <td
                  key={`${row.period_date}-${row.size}-${field}`}
                  className="px-4 py-2 border"
                >
                  <span className="block text-center">
                    {typeof row[field] === "number"
                      ? Math.round(row[field] as number)
                      : String(row[field])}
                  </span>
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
