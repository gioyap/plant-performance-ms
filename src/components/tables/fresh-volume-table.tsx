"use client";

import { createClient } from "@/src/utils/supabase/client";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import * as XLSX from "xlsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Link from "next/link";
import { MfRawSizeRow, Props } from "@/src/lib/types";
import { allFields, formatPeriodDate } from "../core/editablecell";

export default function FreshVolumeTable({ data, period, year }: Props) {
  const supabase = createClient();

  // Update total_volume rows from input data
  useEffect(() => {
    const updateTotalVolume = async () => {
      const { data, error } = await supabase
        .from("mf_raw_sizes")
        .select("period_date, abp, master_plan, actual_received, w_requirements, excess, advance_prod, safekeep, size")
        .neq("size", "total_volume");

      if (error) {
        console.error("Failed to fetch input rows:", error.message);
        return;
      }

      const rows = data as Omit<MfRawSizeRow, "id" | "comp_to_master_plan">[];

      const totalsByDate: Record<string, Omit<MfRawSizeRow, "id">> = {};

      for (const row of rows) {
        const { period_date } = row;

        if (!totalsByDate[period_date]) {
          totalsByDate[period_date] = {
            period_date,
            size: "total_volume",
            abp: 0,
            master_plan: 0,
            actual_received: 0,
            w_requirements: 0,
            excess: 0,
            advance_prod: 0,
            safekeep: 0,
            comp_to_master_plan: 0,
          };
        }

        for (const key of [
          "abp",
          "master_plan",
          "actual_received",
          "w_requirements",
          "excess",
          "advance_prod",
          "safekeep",
        ] as const) {
          totalsByDate[period_date][key] += row[key] ?? 0;
        }
      }

      // Add comp_to_master_plan calculation
      const totalVolumeRows = Object.values(totalsByDate).map((row) => {
        return {
          ...row,
          comp_to_master_plan:
            row.master_plan > 0
              ? (row.actual_received / row.master_plan) * 100
              : 0,
        };
      });

      for (const row of totalVolumeRows) {
        const isEmpty = Object.entries(row).every(([_, val]) =>
          typeof val === "number" ? val === 0 : true
        );
        if (isEmpty) continue;

        const { error: upsertError } = await supabase
          .from("mf_raw_sizes")
          .upsert(row, { onConflict: "period_date,size" });

        if (upsertError) {
          console.error(
            `Upsert failed for ${row.period_date}:`,
            upsertError.message
          );
        }
      }
    };

    updateTotalVolume();
  }, [supabase]);

  const handleExport = async () => {
    const { data, error } = await supabase
      .from("mf_raw_sizes")
      .select("period_date, abp, master_plan, actual_received, w_requirements, excess, advance_prod, safekeep, comp_to_master_plan, size")
      .eq("size", "total_volume")
      .eq("period_type", period)
      .eq("period_year", year)
      .order("period_date", { ascending: true });

    if (error) {
      console.error("Export failed:", error.message);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "total-fresh-volume.xlsx");
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
              <Link href={`/rm-volume/${period}/${year}/size?tab=100g-below`}>
                <DropdownMenuItem>Modify</DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={handleExport}>Export</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <table className="w-full border text-center border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded overflow-x-auto">
        <thead>
          <tr className="bg-orange-500 text-white dark:bg-dark3">
            <th className="border">date</th>
            {allFields.map((field) => (
              <th key={field} className="border">{field.replace(/_/g, " ")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={`${row.period_date}-${row.size}`} className="border">
              <td className="border">{formatPeriodDate(row.period_date, period)}</td>
              {allFields.map((field) => (
                <td key={`${row.period_date}-${field}`} className="border py-2 px-4">
                  {typeof row[field] === "number"
                    ? field === "comp_to_master_plan"
                      ? `${Math.round(row[field])}%`
                      : Math.round(row[field])
                    : row[field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
