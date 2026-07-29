export function BrandStatus() {
  return (
    <ul className={"flex items-center gap-2"}>
      <li
        className={
          "border-border bg-background/40 flex flex-1 flex-col items-center gap-1 rounded-md border-2 px-3 py-1.5"
        }
      >
        <span className={"text-primary-800 dark:text-primary-300 text-xs font-semibold"}>12</span>
        <p className={"text-xs font-light text-neutral-600 dark:text-neutral-200"}>سفارش امروز</p>
      </li>
      <li
        className={
          "border-border bg-background/40 flex flex-1 flex-col items-center gap-1 rounded-md border-2 px-3 py-1.5"
        }
      >
        <span className={"text-secondary-800 dark:text-secondary-300 text-xs font-semibold"}>
          10
        </span>
        <p className={"text-xs font-light text-neutral-600 dark:text-neutral-200"}>برای ارسال</p>
      </li>
    </ul>
  );
}
