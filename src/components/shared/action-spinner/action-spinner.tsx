import { LoaderCircle } from "lucide-react";
export function ActionSpinner() {
  return (
    <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
  );
}
