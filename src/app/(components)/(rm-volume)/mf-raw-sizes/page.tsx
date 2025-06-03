"use client";

import React, { useEffect, useState } from "react";
import { SkeletonLoading } from "@/src/components/core/loading";

import Size100gBelowPage from "@/src/components/tables/(mf_sizes)/size-100g-below";
import Size100g260gPage from "@/src/components/tables/(mf_sizes)/size-100g-260g";
import Size260g350gPage from "@/src/components/tables/(mf_sizes)/size-260g-350g";
import Size350g450gPage from "@/src/components/tables/(mf_sizes)/size-350g-450g";
import Size450g600gPage from "@/src/components/tables/(mf_sizes)/size-450g-600g";
import Size600g720gPage from "@/src/components/tables/(mf_sizes)/size-600g-720g";
import Size720gUpPage from "@/src/components/tables/(mf_sizes)/size-720g-up";

const tabList = [
  { key: "100g-below", label: "100g-Below", Component: Size100gBelowPage },
  { key: "100g-260g", label: "100g–260g", Component: Size100g260gPage },
  { key: "260g-350g", label: "260g–350g", Component: Size260g350gPage },
  { key: "350g-450g", label: "350g–450g", Component: Size350g450gPage },
  { key: "450g-600g", label: "450g–600g", Component: Size450g600gPage },
  { key: "600g-720g", label: "600g–720g", Component: Size600g720gPage },
  { key: "720g-up", label: "720g-Up", Component: Size720gUpPage },
];

export default function FreshVolumePage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabList[0].key);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const CurrentComponent = tabList.find((tab) => tab.key === activeTab)?.Component;

  if (loading) {
    return (
      <div className="p-4">
        <SkeletonLoading />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-dark3">
        {tabList.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.key
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "border-transparent text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="p-4 md:w-[42rem] lg:w-full">
        {CurrentComponent ? <CurrentComponent /> : <p>No table found.</p>}
      </div>
    </div>
  );
}
