"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
};

function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  const style = Object.entries(config).reduce<Record<`--color-${string}`, string>>(
    (styles, [key, value]) => {
      if (value.color) {
        styles[`--color-${key}`] = value.color;
      }

      return styles;
    },
    {},
  );

  return (
    <div
      data-slot="chart"
      className={cn(
        "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground h-64 min-h-64 w-full min-w-0 text-xs",
        className,
      )}
      style={style}
      {...props}
    >
      <ResponsiveContainer height="100%" minHeight={256} minWidth={0} width="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export { ChartContainer };
