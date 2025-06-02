"use client";
import React from "react";
import { cn } from "@/src/lib/utils";
import MainSidebar from "@/src/components/core/mainsidebar";
import { DashboardChart } from "@/src/components/charts/dashboard-areachart";
import DashboardRMVolumeTable from "@/src/components/tables/dashboard-rm-volume";

export default function DashboardPage() {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-h-screen flex-1 overflow-hidden rounded-md border border-neutral-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800",
      )}
    >
      <MainSidebar/>

      {/* Right side content container with vertical stacking */}
      <div className="flex flex-col flex-1">
        <div>
          <DashboardChart />
        </div>
        <div>
          <DashboardRMVolumeTable />
        </div>
      </div>
    </div>
  );
}
