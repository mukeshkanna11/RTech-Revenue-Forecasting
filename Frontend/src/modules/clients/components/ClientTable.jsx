export default function ClientTable({
  clients,
  onEdit,
  onDelete
}) {

  return (
    <div className="bg-white border rounded">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Company</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">GST</th>
            <th className="p-3 text-left">Actions</th>
          </tr>

        </thead>

        <tbody>

          {clients.map((client) => (

            <tr
              key={client._id}
              className="border-t"
            >

              <td className="p-3">{client.name}</td>
              <td className="p-3">{client.companyName}</td>
              <td className="p-3">{client.email}</td>
              <td className="p-3">{client.phone}</td>
              <td className="p-3">{client.gstNumber}</td>

              <td className="p-3 space-x-2">

                <button
                  onClick={() => onEdit(client)}
                  className="px-3 py-1 text-white bg-yellow-500 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(client._id)}
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