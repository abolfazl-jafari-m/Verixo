import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ShipmentCard } from "@/features/dashboard/components/today-shipments/shipment-card/shipment-card";
import { TodayOrder } from "@/features/dashboard/types/today-order";
import { useTranslations } from "next-intl";

const todayOrders: TodayOrder[] = [
  {
    id: 4532,
    status: "packing",
    customer_name: "مریم صادقی",
    order_address: "تهران، نارمک",
    order_shipment: "پیک موتوری",
  },
  {
    id: 4538,
    status: "shipping",
    customer_name: "کاوه نوری",
    order_address: "تهران، سعادت‌آباد",
    order_shipment: "تیپاکس",
  },
  {
    id: 4541,
    status: "completed",
    customer_name: "سارا احمدی",
    order_address: "کرج، عظیمیه",
    order_shipment: "پست پیشتاز",
  },
  {
    id: 4547,
    customer_name: "علی رضایی",
    order_address: "تهران، تهرانپارس",
    order_shipment: "پیک موتوری",
  },
];
export function TodayShipments() {
  const t = useTranslations("dashboard.shipments");

  return (
    <div className={"space-y-4"}>
      <div className={"flex items-center justify-between"}>
        <div className={"flex items-center gap-2"}>
          <h2 className={"font-semibold"}>{t("title")}</h2>
          <Badge variant={"default"} className={"h-fit text-[10px]"}>
            {t("itemCount", { count: 4 })}
          </Badge>
        </div>
        <div className={"flex items-center gap-0.5"}>
          <p className={"text-sm"}>{t("all")}</p>
          <ChevronLeft className={"size-3"} />
        </div>
      </div>
      <Carousel className="lg:px-11" dir={"rtl"} opts={{ direction: "rtl", align: "start" }}>
        <CarouselContent className={"py-2"}>
          {todayOrders.map((order) => (
            <CarouselItem key={order.id} className={"basis-2/3 sm:basis-1/2 lg:basis-1/3"}>
              <ShipmentCard order={order} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="border-border/70 bg-background/90 inset-s-0 hidden shadow-sm lg:inline-flex" />
        <CarouselNext className="border-border/70 bg-background/90 inset-e-0 hidden shadow-sm lg:inline-flex" />
      </Carousel>
    </div>
  );
}
