"use client";
import React from "react";
import { cn } from "@/src/lib/utils";
import MainSidebar from "@/src/components/core/mainsidebar";
import { DashboardChart } from "@/src/components/charts/areachart";

export default function DashboardPage() {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-h-screen flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-[60vh]"
      )}
    >
      <MainSidebar />
      <DashboardChart/>
    </div>
  );
}
