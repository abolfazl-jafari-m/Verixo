import React from "react";

export function MobileNavSvg() {
  return (
    <svg
      width="100%"
      height="70"
      viewBox="0 0 390 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary-500)" />
          <stop offset="55%" stopColor="var(--primary-600)" />
          <stop offset="100%" stopColor="var(--primary-700)" />
        </linearGradient>
      </defs>

      <path
        fill="url(#navGradient)"
        d="
M0 0
H135

C148 0 156 4 164 20
C172 37 182 48 195 48
C208 48 218 37 226 20
C234 4 242 0 255 0

H390
V88
H0
Z
"
      />
    </svg>
  );
}
