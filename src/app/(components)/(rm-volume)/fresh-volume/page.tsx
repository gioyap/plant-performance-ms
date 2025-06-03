"use client";

import React, { useState, useEffect } from "react";
import { FreshVolumeChart } from "@/src/components/charts/fresh-volume-chart";
import FreshVolumeTable from "@/src/components/tables/fresh-volume-table";
import { SkeletonLoading } from "@/src/components/core/loading";

export default function FreshVolumePage() {
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
      <FreshVolumeChart />
      <FreshVolumeTable />
    </>
  );
}
