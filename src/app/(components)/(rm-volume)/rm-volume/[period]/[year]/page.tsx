// /src/app/rm-volume/[period]/[year]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FreshVolumeTable from "@/src/components/tables/fresh-volume-table";
import ChartPeriodPage from "@/src/components/charts/fresh-volume-chart";
import { createClient } from "@/src/utils/supabase/client";
import { MfRawSizeRow } from "@/src/lib/types";
import { format, parseISO } from "date-fns";
import { SkeletonLoading } from "@/src/components/core/loading";

export default function FreshVolumePage() {
  const params = useParams();
  const period = params.period as string; // "daily", "weekly", "monthly"
  const year = parseInt(params.year as string, 10); // Extract year from URL

  const [data, setData] = useState<MfRawSizeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("mf_raw_sizes")
      .select("period_date, abp, master_plan, actual_received, w_requirements, excess, advance_prod, safekeep, comp_to_master_plan")
      .eq("size", "total_volume")
      .eq("period_type", period)
      .eq("period_year", year)
      .order("period_date", { ascending: true });

    if (error) {
      console.error("Error fetching data:", error.message);
      return;
    }

    const formatted = (data as MfRawSizeRow[]).map((row) => {
      const date = parseISO(row.period_date);
      let label = "";
      if (period === "daily") label = format(date, "MMM d");
      else if (period === "weekly") label = `W${format(date, "I")} (${format(date, "MMM d")})`;
      else if (period === "monthly") label = format(date, "MMM yyyy");
      return { ...row, date: label };
    });

    setData(formatted);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [period, year]);

  if (loading) {
    return (
      <div>
        {[...Array(6)].map((_, i) => (
          <SkeletonLoading key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      <ChartPeriodPage
        period={period}
        year={year}
        setYear={() => {}}
        data={data}
      />
      <FreshVolumeTable
        period={period}
        year={year}
        data={data}
      />
    </>
  );
}
