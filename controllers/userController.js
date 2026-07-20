const service = require("../services/userService");

exports.create = async (req, res, next) => {
  console.log("req.body", req.body)
  try {
    const user = await service.createUser(req.body);

    res.status(201).json({ data: user, status: true });
  } catch (err) {
    next(err)
  }
};

exports.sendOtp = async (req, res, next) => {
  console.log("req.body", req.body)
  try {
    const otp = await service.sendOtp(req.body.phone);

    res.status(200).json({ data: otp, status: true });
  } catch (err) {
    next(err)
  }
};

exports.findAll = async (req, res) => {
  const users = await service.getUsers();
  res.json(users);
};

exports.findOne = async (req, res) => {
  const user = await service.getUser(req.params.id);

  if (!user)
    return res.status(404).json({
      message: "User not found",
    });

  res.json(user);
};

exports.update = async (req, res) => {
  const user = await service.updateUser(req.params.id, req.body);

  if (!user)
    return res.status(404).json({
      message: "User not found",
    });

  res.json(user);
};

exports.remove = async (req, res) => {
  const deleted = await service.deleteUser(req.params.id);

  if (!deleted)
    return res.status(404).json({
      message: "User not found",
    });

  res.json({
    message: "Deleted successfully",
  });
};