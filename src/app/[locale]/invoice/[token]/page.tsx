import { PublicInvoice } from "@/features/invoices/components";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PublicInvoice token={token} />;
}
