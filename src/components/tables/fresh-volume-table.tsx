"use client";

import { createClient } from "@/src/utils/supabase/client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import * as XLSX from "xlsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { FreshVolumeRow } from "@/src/lib/types";
import Link from "next/link";

export default function FreshVolumeTable() {
  const supabase = createClient();
  const [data, setData] = useState<FreshVolumeRow[]>([]);

useEffect(() => {
  const fetchData = async () => {
    // 1. Fetch all rows excluding `total_volume`
    const { data, error } = await supabase
      .from("mf_raw_sizes")
      .select("date, abp, master_plan, actual_received, w_requirements, excess, advance_prod, safekeep, comp_to_master_plan, size")
      .neq("size", "total_volume");

    if (error) {
      console.error("Failed to fetch input rows:", error.message);
      return;
    }

    const rows = data as Omit<FreshVolumeRow, "id">[];

    // 2. Compute total_volume per date
    const totalsByDate: Record<string, Omit<FreshVolumeRow, "id">> = {};

    for (const row of rows) {
      const { date } = row;

      if (!totalsByDate[date]) {
        totalsByDate[date] = {
          date,
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
        "comp_to_master_plan",
      ] as const) {
        totalsByDate[date][key] += row[key] ?? 0;
      }
    }
    //final result
    const totalVolumeRows = Object.values(totalsByDate);

    // 3. Upsert total_volume rows and collect returned rows with `id`s
    const upsertedData: FreshVolumeRow[] = [];

    for (const row of totalVolumeRows) {
      const isEmpty = Object.entries(row).every(
        ([key, val]) => typeof val === "number" ? val === 0 : true
      );
      if (isEmpty) continue;

      const { data: upserted, error: upsertError } = await supabase
        .from("mf_raw_sizes")
        .upsert(row, { onConflict: "date,size" })
        .select("id, date, abp, master_plan, actual_received, w_requirements, excess, advance_prod, safekeep, comp_to_master_plan, size");

      if (upsertError) {
        console.error(`Failed to upsert total_volume for ${row.date}:`, upsertError.message);
      } else if (upserted) {
        upsertedData.push(...upserted);
      }
    }

    // 4. Sort final data by month name
    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const sortedData = upsertedData.sort((a, b) =>
      monthOrder.indexOf(a.date) - monthOrder.indexOf(b.date)
    );

    setData(sortedData);
  };

  fetchData();
}, [supabase]);

const handleExport = async () => {
  const { data, error } = await supabase
    .from("mf_raw_sizes")
    .select("date, abp, master_plan, actual_received, w_requirements, excess, advance_prod, safekeep, comp_to_master_plan, size")
    .eq("size", "total_volume")
    .order("id", { ascending: true });

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
              <Link href={"/mf-raw-sizes"}>
              <DropdownMenuItem>Modify</DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={handleExport}>Export</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <table className=" w-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded overflow-x-auto">
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
            <tr key={`${row.date}-${row.size}`}>
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
                 <td key={`${row.date}-${row.size}-${field}`} className="px-4 py-2 border">
                  <span className="block w-full text-center">
                    {row[field]}
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
