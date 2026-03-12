const service = require("./client.service");

exports.createClient = async (req, res, next) => {
  try {

    const client = await service.createClient(req.body);

    res.status(201).json({
      success: true,
      data: client
    });

  } catch (err) {
    next(err);
  }
};

exports.getClients = async (req, res, next) => {
  try {

    const result = await service.getClients(req.query);

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    next(err);
  }
};

exports.getClient = async (req, res, next) => {
  try {

    const client = await service.getClientById(req.params.id);

    res.json({
      success: true,
      data: client
    });

  } catch (err) {
    next(err);
  }
};

exports.updateClient = async (req, res, next) => {
  try {

    const client = await service.updateClient(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: client
    });

  } catch (err) {
    next(err);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {

    await service.deleteClient(req.params.id);

    res.json({
      success: true,
      message: "Client deleted"
    });

  } catch (err) {
    next(err);
  }
};