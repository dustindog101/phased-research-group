import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { AccountSettingsClient } from "@/components/account/settings-client";

export default async function AccountSettingsPage() {
  const user = await requireUser();

  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const serializedAddresses = addresses.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    state: a.state,
    zip: a.zip,
    country: a.country,
    phone: a.phone ?? "",
    isDefault: a.isDefault,
  }));

  return (
    <section className="py-10">
      <div className="prg-container max-w-3xl">
        <h1 className="text-[28px] font-bold uppercase tracking-[2px] mb-6" style={{ fontFamily: "var(--font-display)" }}>
          Account Settings
        </h1>
        <AccountSettingsClient userEmail={user.email} userName={user.name ?? ""} addresses={serializedAddresses} />
      </div>
    </section>
  );
}
