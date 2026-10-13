"use client";

import { useDraggable } from "@dnd-kit/core";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "../../types";
import { OrderCard } from "../order-card/order-card";

export function DraggableOrder({
  order,
  onOpen,
  onMove,
  selection,
}: {
  order: Order;
  onOpen: () => void;
  onMove: (status: OrderStatus) => void;
  selection?: ReactNode;
}) {
  const t = useTranslations("orders");
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: order.id,
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-full min-w-0 shrink-0 rounded-xl",
        isDragging && "bg-primary/5 ring-primary/30 opacity-30 ring-2 ring-inset",
      )}
    >
      <OrderCard
        order={order}
        selection={selection}
        onOpen={onOpen}
        onMove={onMove}
        handle={
          <Button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary size-9 cursor-grab touch-none rounded-lg active:cursor-grabbing"
            aria-label={t("dragOrder", { number: order.number })}
          >
            <GripVertical className="size-4" />
          </Button>
        }
      />
    </div>
  );
}
