const clientService = require("./client.service");

const createClient = async (req, res) => {
  const client = await clientService.createClient(req.body);

  res.status(201).json({
    success: true,
    message: "Client created successfully",
    data: client
  });
};

const getClients = async (req, res) => {
  const { page, limit, search } = req.query;

  const clients = await clientService.getClients({
    page,
    limit,
    search
  });

  res.json({
    success: true,
    data: clients
  });
};

const getClientById = async (req, res) => {
  const client = await clientService.getClientById(req.params.id);

  res.json({
    success: true,
    data: client
  });
};

const updateClient = async (req, res) => {
  const client = await clientService.updateClient(
    req.params.id,
    req.body
  );

  res.json({
    success: true,
    message: "Client updated successfully",
    data: client
  });
};

const deleteClient = async (req, res) => {
  await clientService.deleteClient(req.params.id);

  res.json({
    success: true,
    message: "Client deleted successfully"
  });
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
};