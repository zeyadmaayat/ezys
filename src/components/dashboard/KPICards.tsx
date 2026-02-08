import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, ClipboardList, DollarSign, Truck, Package } from "lucide-react";

export type KPIItem = {
  label: string;
  value: string | number;
  delta?: number; // percentage delta (+/-)
  icon?: React.ComponentType<{ className?: string }>;
};

type Props = {
  kpis: KPIItem[];
  loading?: boolean;
};

export default function KPICards({ kpis, loading }: Props) {
  const { language } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <div className="flex items-end gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // fallback icons if not provided
  const fallbackIcons = [Package, Truck, ClipboardList, DollarSign];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon ?? fallbackIcons[index % fallbackIcons.length];
        const delta = kpi.delta ?? 0;
        const hasDelta = kpi.delta !== undefined && kpi.delta !== 0;

        return (
          <Card key={index} className="relative overflow-hidden p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">
                {kpi.label}
              </span>
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight">
                {kpi.value}
              </span>

              {hasDelta && (
                <span
                  className={[
                    "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium mb-1",
                    delta > 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
                  ].join(" ")}
                >
                  {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {Math.abs(delta)}%
                </span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
