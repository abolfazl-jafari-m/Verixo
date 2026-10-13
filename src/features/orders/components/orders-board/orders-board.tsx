"use client";

import { useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import styles from "./orders-scrollbar.module.css";
import { isOrderStatus, orderStatuses, type Order, type OrderStatus } from "../../types";
import { OrderCard } from "../order-card/order-card";
import { columnKeyboardCoordinates } from "./keyboard-coordinates";
import { canMoveOrder } from "../../mock-workflow";

import { OrdersKanbanColumn } from "../orders-kanban-column/orders-kanban-column";
import { DraggableOrder } from "../draggable-order/draggable-order";

export function OrdersBoard({
  orders,
  onOpen,
  onMove,
  renderSelection,
}: {
  orders: Order[];
  onOpen: (id: string) => void;
  onMove: (id: string, status: OrderStatus) => void;
  renderSelection?: (order: Order) => ReactNode;
}) {
  const t = useTranslations("orders");
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: columnKeyboardCoordinates }),
  );
  const activeOrder = orders.find((order) => order.id === activeId);
  return (
    <DndContext
      id="orders-board"
      sensors={sensors}
      collisionDetection={closestCorners}
      accessibility={{
        screenReaderInstructions: { draggable: t("dragInstructions") },
        announcements: {
          onDragStart: () => t("dragStarted"),
          onDragOver: ({ over }) =>
            over && isOrderStatus(over.id)
              ? t("dragOver", { status: t(`statuses.${over.id}`) })
              : undefined,
          onDragEnd: ({ active, over }) => {
            const order = orders.find((item) => item.id === active.id);
            if (!order || !over || !isOrderStatus(over.id)) return t("dragCanceled");
            return canMoveOrder(order, over.id)
              ? t("dragEnded", { status: t(`statuses.${over.id}`) })
              : t("customerFlow.blocked");
          },
          onDragCancel: () => t("dragCanceled"),
        },
      }}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={({ active, over }) => {
        if (over && isOrderStatus(over.id)) onMove(String(active.id), over.id);
        setActiveId(null);
      }}
    >
      <div
        className={cn(
          "focus-visible:ring-ring flex w-full max-w-full min-w-0 justify-between gap-4 overflow-x-auto overscroll-x-contain rounded-2xl p-0.5 pb-4 outline-none focus-visible:ring-2",
          styles.scrollbar,
        )}
        role="region"
        aria-label={t("board")}
        tabIndex={0}
      >
        {orderStatuses.map((status) => {
          const group = orders.filter((order) => order.status === status);
          return (
            <OrdersKanbanColumn
              key={status}
              status={status}
              count={group.length}
              dragging={activeId !== null}
            >
              {group.map((order) => (
                <DraggableOrder
                  key={order.id}
                  order={order}
                  selection={renderSelection?.(order)}
                  onOpen={() => onOpen(order.id)}
                  onMove={(next) => onMove(order.id, next)}
                />
              ))}
            </OrdersKanbanColumn>
          );
        })}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeOrder && (
          <div className="ring-primary/40 rounded-xl shadow-2xl ring-2">
            <OrderCard order={activeOrder} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
