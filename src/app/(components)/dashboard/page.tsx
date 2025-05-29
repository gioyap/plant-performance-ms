"use client";
import React from "react";
import { cn } from "@/src/lib/utils";
import MainSidebar from "@/src/components/core/mainsidebar";
import { signOutAction } from "../../actions";
import { Button } from "@/src/components/ui/button";

export default function DashboardPage() {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-h-screen flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-[60vh]"
      )}
    >
      <MainSidebar />
      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex gap-2">
            {[...new Array(4)].map((_, idx) => (
              <div
                key={"first-array-demo-1" + idx}
                className="h-20 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
              ></div>
            ))}
          </div>
          <div className="flex flex-1 gap-2">
            {[...new Array(2)].map((_, idx) => (
              <div
                key={"second-array-demo-1" + idx}
                className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
