import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

import { actionPresentation, type ActionState } from "../action-state";
import { cn } from "@/lib/utils";
export interface ActionRequiredOrder {
  id: string;
  number: string;
  customer: string;
  state: ActionState;
  issue: string;
  amount: string;
  updatedAt: string;
}
export function NeedActionCard({
  order,
  onAction,
  disabled,
}: {
  order: ActionRequiredOrder;
  onAction: () => void;
  disabled: boolean;
}) {
  const t = useTranslations("dashboard.actions");

  const { icon: Icon, tone } = actionPresentation[order.state];
  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className={"flex items-center justify-between gap-3"}>
        <CardTitle className={"text-primary-800 dark:text-primary-200 flex items-center gap-2"}>
          <div className={cn("rounded-full p-1.5", tone)}>
            <Icon className={"size-3"} />
          </div>
          <h4 className={"text-xs font-semibold"}>{t(order.state)}</h4>
        </CardTitle>
        <div className={"flex flex-col items-center gap-1 text-[10px]"}>
          <span>
            <bdi>#{order.number}</bdi>
          </span>
          <div className={"flex items-center gap-1"}>
            <Clock className={"size-3"} />
            <span>{order.updatedAt}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className={"text-sm font-semibold break-words"}>{order.customer}</h4>
        <p className={"text-muted-foreground text-xs"}>{order.issue}</p>
      </CardContent>
      <Separator />
      <CardFooter className={"flex flex-wrap items-center justify-between gap-3"}>
        <p className={"text-sm font-semibold"}>{order.amount}</p>
        <Button
          onClick={onAction}
          disabled={disabled}
          variant={"default"}
          className={
            "bg-primary-600 hover:bg-primary-700 text-primary-foreground flex items-center justify-center gap-1 text-xs shadow-sm"
          }
        >
          <Icon className={"size-3"} />
          {t(order.state)}
        </Button>
      </CardFooter>
    </Card>
  );
}
