import { db } from "@/db";
import { formatPrice } from "@/lib/constants";
import { AdminUsersClient } from "@/components/admin/users-client";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const roleFilter = sp.role ?? "all";

  const where: Record<string, unknown> = {};
  if (roleFilter !== "all") where.role = roleFilter.toUpperCase();
  if (query) {
    where.OR = [
      { email: { contains: query } },
      { username: { contains: query } },
      { name: { contains: query } },
    ];
  }

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });

  const usersWithStats = await Promise.all(
    users.map(async (u) => {
      const orderStats = await db.order.aggregate({
        where: { userId: u.id, paymentStatus: "PAID" },
        _sum: { total: true },
      });
      return {
        id: u.id,
        email: u.email,
        username: u.username,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        orderCount: u._count.orders,
        totalSpent: orderStats._sum.total ?? 0,
      };
    })
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold uppercase tracking-[3px] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Users
        </h1>
        <p className="text-sm text-[var(--prg-text-muted)]">
          {users.length} user{users.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      <AdminUsersClient users={usersWithStats} />
    </div>
  );
}
