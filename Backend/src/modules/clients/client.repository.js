const Client = require("./client.model");

exports.create = (data) => Client.create(data);

exports.findAll = (filter, options) =>
  Client.find(filter)
    .skip(options.skip)
    .limit(options.limit)
    .sort(options.sort);

exports.count = (filter) => Client.countDocuments(filter);

exports.findById = (id) => Client.findById(id);

exports.update = (id, data) =>
  Client.findByIdAndUpdate(id, data, { new: true });

exports.softDelete = (id) =>
  Client.findByIdAndUpdate(id, { isDeleted: true }, { new: true });