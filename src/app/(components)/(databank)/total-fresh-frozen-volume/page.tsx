"use client";

import React, { useState, useEffect } from "react";
import { DashboardChart } from "@/src/components/charts/dashboard-areachart";
import DashboardRMVolumeTable from "@/src/components/tables/dashboard-rm-volume";
import { SkeletonLoading } from "@/src/components/core/loading";

export default function TotalVolumePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // Simulate fetch
    return () => clearTimeout(timer);
  }, []);

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
      <DashboardChart />
      <DashboardRMVolumeTable />
    </>
  );
}
