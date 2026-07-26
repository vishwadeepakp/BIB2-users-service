const { token } = require("morgan");
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

exports.verifyOtp = async (req, res, next) => {
  try {
    const data = await service.verifyOtp(req.body.phone, req.body.otp);
    // Access Token Cookie
    res.cookie('accessToken', data.user.accessToken, {
      httpOnly: true, // JS से एक्सेस ब्लॉक
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 मिनट
    });

    // Refresh Token Cookie
    res.cookie('refreshToken', data.user.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/', // या सुरक्षा के लिए '/api/auth/refresh'
      maxAge: 365 * 24 * 60 * 60 * 1000, // 365 दिन
    });

    res.status(200).json({ data: { id: data.user.id, mobile: data.user.mobile }, status: true });
  } catch (err) {
    next(err)
  }
};

exports.refreshTokens = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.headers.authorization?.split(' ')[1];
    const data = await service.refreshTokens(refreshToken);
    console.log("data from refreshTokens 22", data)
    res.cookie('accessToken', data.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 Minutes
    });
    res.status(200).json({ data: { message: 'token updated' }, status: true });

    // Implement refresh token logic here
  } catch (error) {
    next(error);
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