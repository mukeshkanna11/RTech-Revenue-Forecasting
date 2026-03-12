const repo = require("./client.repository");

exports.createClient = async (data) => {
  return repo.create(data);
};

exports.getClients = async (query) => {

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const filter = {
    isDeleted: false
  };

  if (query.status) filter.status = query.status;

  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, "i") },
      { email: new RegExp(query.search, "i") },
      { companyName: new RegExp(query.search, "i") }
    ];
  }

  const options = {
    skip,
    limit,
    sort: { createdAt: -1 }
  };

  const clients = await repo.findAll(filter, options);
  const total = await repo.count(filter);

  return {
    clients,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

exports.getClientById = async (id) => {
  return repo.findById(id);
};

exports.updateClient = async (id, data) => {
  return repo.update(id, data);
};

exports.deleteClient = async (id) => {
  return repo.softDelete(id);
};