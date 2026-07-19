const User = require("../models/user");

exports.createUser = async (data) => {
  return await User.create(data);
};

exports.getUsers = async () => {
  return await User.findAll();
};

exports.getUser = async (id) => {
  return await User.findByPk(id);
};

exports.updateUser = async (id, data) => {
  const user = await User.findByPk(id);

  if (!user) return null;

  await user.update(data);

  return user;
};

exports.deleteUser = async (id) => {
  const user = await User.findByPk(id);

  if (!user) return false;

  await user.destroy();

  return true;
};