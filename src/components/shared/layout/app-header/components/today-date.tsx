"use client";
import React from "react";
import { useLocale } from "next-intl";

export function TodayDate() {
  const locale = useLocale();
  const today = new Date().getTime();
  const date = Intl.DateTimeFormat(locale, {
    calendar: "persian",
    timeZone: "Asia/Tehran",
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(today);
  return <p className={"text-xs font-light"}>{date}</p>;
}
