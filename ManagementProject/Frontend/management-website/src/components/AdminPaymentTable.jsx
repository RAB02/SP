export default function AdminPaymentsTable({
  payments,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 overflow-hidden w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Payments
        </h2>

        <div className="flex gap-2">
          {["all", "Paid", "Pending", "Overdue"].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-medium border",
                  isActive
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100",
                ].join(" ")}
              >
                {status === "all" ? "All" : status}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-2 font-medium text-slate-600">
                Tenant
              </th>
              <th className="px-4 py-2 font-medium text-slate-600">
                Apartment
              </th>
              <th className="px-4 py-2 font-medium text-slate-600">
                Date
              </th>
              <th className="px-4 py-2 font-medium text-slate-600">
                Method
              </th>
              <th className="px-4 py-2 font-medium text-slate-600">
                Amount
              </th>
              <th className="px-4 py-2 font-medium text-slate-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  No payments found.
                </td>
              </tr>
            )}

            {payments.map((p) => (
              <tr
                key={p.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-4 py-2 text-slate-900">
                  {p.tenantName}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {p.apartment}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {p.date}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {p.method}
                </td>
                <td className="px-4 py-2 text-slate-900">
                  ${Number(p.amount || 0).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      p.status === "Paid" &&
                        "bg-emerald-50 text-emerald-700",
                      p.status === "Pending" &&
                        "bg-amber-50 text-amber-700",
                      p.status === "Overdue" &&
                        "bg-rose-50 text-rose-700",
                    ].join(" ")}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}