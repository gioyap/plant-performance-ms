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

  useEffect(() => {
    const generateTotalVolumeIfAllSizesPresent = async () => {

      const { data: allRows, error } = await supabase
        .from("mf_rm_volume")
        .select("*")
        .eq("period_type", period)
        .eq("period_year", year)
        .neq("size", "total_volume");

      if (error) {
        console.error("Error fetching rows:", error.message);
        return;
      }

      const groupedByDate: Record<string, MfRawSizeRow[]> = {};

      for (const row of allRows || []) {
        const key = row.period_date;
        if (!groupedByDate[key]) groupedByDate[key] = [];
        groupedByDate[key].push(row);
      }

      for (const [period_date, rows] of Object.entries(groupedByDate)) {
        // Check if total_volume already exists
        const { data: existingTotal } = await supabase
          .from("mf_rm_volume")
          .select("id")
          .eq("period_type", period)
          .eq("period_year", year)
          .eq("period_date", period_date)
          .eq("size", "total_volume")
          .limit(1);

        if (existingTotal && existingTotal.length > 0) continue;

        // Sum all values
        const totals = {
          abp: 0,
          master_plan: 0,
          actual_received: 0,
          w_requirements: 0,
          excess: 0,
          advance_prod: 0,
          safekeep: 0,
        };

        rows.forEach((row) => {
          for (const key in totals) {
            totals[key as keyof typeof totals] += row[key as keyof typeof totals] ?? 0;
          }
        });

        const comp_to_master_plan =
          totals.master_plan > 0
            ? (totals.actual_received / totals.master_plan) * 100
            : 0;

        const upsertResult = await supabase.from("mf_rm_volume").upsert({
          size: "total_volume",
          period_date,
          period_type: period,
          period_year: year,
          ...totals,
          comp_to_master_plan,
          }, {
        onConflict: "period_date,size", // 👈 key part
          });

        if (upsertResult.error) {
          console.error(`Failed to insert total_volume for ${period_date}`, upsertResult.error.message);
        } else {
          console.log(`Inserted total_volume for ${period_date}`);
        }
      }
    };

    generateTotalVolumeIfAllSizesPresent();
  }, [supabase, period, year]);

  const handleExport = async () => {
    const { data, error } = await supabase
      .from("mf_rm_volume")
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
