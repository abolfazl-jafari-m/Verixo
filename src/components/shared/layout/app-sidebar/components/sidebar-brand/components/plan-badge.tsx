import { Badge } from "@/components/ui/badge";
import star from "@/assets/icons/star-circle.svg";
import Image from "next/image";
export function PlanBadge() {
  return (
    <Badge
      variant={"outline"}
      className={
        "border-primary-900 bg-primary-600 text-primary-100 shadow-primary-900 relative h-fit border px-4 py-1 shadow-sm ltr:ml-auto rtl:mr-auto"
      }
    >
      <span> پلن رایگان</span>
      <Image src={star} alt={"plan"} width={18} height={18} />
    </Badge>
  );
}
