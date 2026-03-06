export default function InvoiceTable({
  invoices,
  onEdit,
  onDelete
}) {

  return (

    <div className="overflow-x-auto bg-white border rounded">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>
            <th className="p-3 text-left">Invoice</th>
            <th className="p-3 text-left">Client</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Due Date</th>
            <th className="p-3 text-left">Actions</th>
          </tr>

        </thead>

        <tbody>

          {invoices.map((inv) => (

            <tr
              key={inv._id}
              className="border-t"
            >

              <td className="p-3 font-medium">
                {inv.invoiceNumber}
              </td>

              <td className="p-3">
                {inv.client?.name || "Client"}
              </td>

              <td className="p-3">
                ₹{inv.totalAmount}
              </td>

              <td className="p-3">

                <span className="px-2 py-1 text-xs bg-gray-200 rounded">
                  {inv.status}
                </span>

              </td>

              <td className="p-3">
                {inv.dueDate?.substring(0,10)}
              </td>

              <td className="p-3 space-x-2">

                <button
                  onClick={() => onEdit(inv)}
                  className="px-3 py-1 text-white bg-yellow-500 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(inv._id)}
                  className="px-3 py-1 text-white bg-red-600 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}