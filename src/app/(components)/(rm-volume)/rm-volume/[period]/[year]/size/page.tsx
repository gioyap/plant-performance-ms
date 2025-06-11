// /src/app/rm-volume/[period]/[year]/size
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import MfRawSizeTable from "@/src/components/tables/mf-raw-size-table";
import { useRouter } from "next/navigation";

const SIZE_TABS = [
  "100g-below",
  "100g-260g",
  "260g-350g",
  "350g-450g",
  "450g-600g",
  "600g-720g",
  "720g-up",
];

export default function EditSizePage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(SIZE_TABS[0]);
  const { period, year: yearParam } = useParams();
  const [year, setYear] = useState<number>(() => parseInt(yearParam as string, 10));
  const router = useRouter();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && SIZE_TABS.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  if (!period || typeof period !== "string") {
    return <div className="p-4">Invalid period</div>;
  }

  return (
    <div className="p-4">
      {/* Tab Headers */}
      <div className="flex flex-wrap border-b mb-4">
        {SIZE_TABS.map((tab) => (
          <button
            key={tab}
           onClick={() => {
                setActiveTab(tab);
                router.replace(`?tab=${tab}`);
              }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "border-transparent text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Table */}
      <MfRawSizeTable
        size={activeTab}
        period={period as string}
        year={year}
      />
    </div>
  );
}
