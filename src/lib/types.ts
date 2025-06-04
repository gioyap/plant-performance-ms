import { JSX } from "react";

export interface FreshVolumeRow {
  id: number;
  date: string;
  abp: number;
  master_plan: number;
  actual_received: number;
  w_requirements: number;
  excess: number;
  advance_prod: number;
  safekeep: number;
  comp_to_master_plan: number;
  size: string;
}

export interface RMVolumeRow {
  id: number;
  abp: number;
  totalrm: number;
  lastabp: number;
  lasttotalrm: number;
}

export interface ChartRow {
  date: string
  abp: number
  master_plan: number
  actual_received: number
  w_requirements: number
  excess: number
  advance_prod: number
  safekeep: number
  comp_to_master_plan: number
}

export interface Links {
  label: string;
  href?: string;
  icon: React.JSX.Element | React.ReactNode;
  type?: "link" | "logout" | string;
 children?: {
    label: string;
    href: string;
    icon?: JSX.Element;
  }[];
}
