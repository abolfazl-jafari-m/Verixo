import type { OrderLine } from "./types";

// Decimal inputs are converted to integer fractions before percentage rounding.
// This also preserves existing fractional prices without changing stored unit prices.
function fraction(value: number): [bigint, bigint] {
  const [mantissa, exponent = "0"] = value.toString().split("e");
  const [whole, decimals = ""] = mantissa.split(".");
  const places = decimals.length - Number(exponent);
  return places >= 0
    ? [BigInt(whole + decimals), BigInt(10) ** BigInt(places)]
    : [BigInt(whole + decimals) * BigInt(10) ** BigInt(-places), BigInt(1)];
}
function sum(values: number[]): [bigint, bigint] {
  return values.reduce<[bigint, bigint]>(
    ([total, scale], value) => {
      const [units, divisor] = fraction(value);
      const common = scale > divisor ? scale : divisor;
      return [total * (common / scale) + units * (common / divisor), common];
    },
    [BigInt(0), BigInt(1)],
  );
}
function rounded(numerator: bigint, denominator: bigint) {
  return Number((numerator * BigInt(2) + denominator) / (denominator * BigInt(2)));
}
export function orderTotals(lines: OrderLine[], shipping: number, discountPercentage = 0) {
  const gross = lines.map((line) => line.quantity * line.unitPrice);
  // Zero-discount historical invoices retain their previous arithmetic.
  const subtotal = gross.reduce((total, amount) => total + amount, 0);
  const [units, scale] = sum(gross);
  const basisPoints = BigInt(Math.round(discountPercentage * 100));
  const discountAmount = Math.min(subtotal, rounded(units * basisPoints, scale * BigInt(10000)));
  const [netUnits, netScale] = sum([subtotal, -discountAmount]);
  const discountedSubtotal = Number(netUnits) / Number(netScale);
  const [totalUnits, totalScale] = sum([discountedSubtotal, shipping]);
  return {
    subtotal,
    discountPercentage,
    discountAmount,
    discountedSubtotal,
    total: discountPercentage === 0 ? subtotal + shipping : Number(totalUnits) / Number(totalScale),
    count: lines.reduce((total, line) => total + line.quantity, 0),
  };
}
// Allocate the already-rounded order discount once, with the rounding remainder
// carried forward in stable line order. Do not write these into legacy adjustments.
export function allocateOrderDiscount(lines: OrderLine[], discountPercentage = 0) {
  const { subtotal, discountAmount } = orderTotals(lines, 0, discountPercentage);
  if (!subtotal || !discountAmount) return lines.map(() => 0);
  const gross = lines.map((line) => line.quantity * line.unitPrice);
  const [totalUnits, totalScale] = sum(gross);
  const [discountUnits, discountScale] = fraction(discountAmount);
  let allocated = 0;
  let cumulativeGross = BigInt(0);
  return gross.map((grossAmount, index) => {
    const [lineUnits, lineScale] = fraction(grossAmount);
    cumulativeGross += lineUnits * (totalScale / lineScale);
    const cumulative =
      index === gross.length - 1
        ? discountAmount
        : rounded(discountUnits * cumulativeGross * totalScale, discountScale * totalUnits) /
          Number(totalScale);
    const amount = cumulative - allocated;
    allocated = cumulative;
    return amount;
  });
}
