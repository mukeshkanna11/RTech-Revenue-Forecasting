const Client = require("./client.model");

const createClient = async (payload) => {
  return Client.create(payload);
};

const getClients = async ({ page = 1, limit = 10, search = "" }) => {
  const query = {
    isDeleted: false,
    $or: [
      { name: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } }
    ]
  };

  const clients = await Client.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Client.countDocuments(query);

  return {
    data: clients,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

const getClientById = async (id) => {
  return Client.findOne({ _id: id, isDeleted: false });
};

const updateClient = async (id, payload) => {
  return Client.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  );
};

const deleteClient = async (id) => {
  return Client.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
};