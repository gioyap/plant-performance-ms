import { JSX } from "react";

export type EditableCellProps = {
  value: number;
  onBlur: (val: string) => void;
};

export interface RMVolumeRow {
  id: number;
  abp: number;
  totalrm: number;
  lastabp: number;
  lasttotalrm: number;
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

export interface Props {
  data: MfRawSizeRow[];
  period: string;
  year: number;
}

export type ChartProps = {
  period: string;
  year: number;
  setYear: (val: number) => void;
  data: MfRawSizeRow[];
};


export interface MfRawSizeTableProps {
  size: string;
  period: string;
  year: number;
}

export interface MfRawSizeRow {
  id: number;
  period_date: string;
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