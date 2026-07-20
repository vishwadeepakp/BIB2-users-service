const User = require("../models/user");

exports.createUser = async (data) => {
  return await User.create(data);
};

exports.sendOtp = async (mobile) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "Authorization": process.env.OTP_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: "q",
        language: 'english',
        number: mobile,
        message: `Your OTP is ${otp}. Please do not share it with anyone.`
      })
    });

    console.log("response", response)

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "error in calling fast2sms API")
    }
    return data

  } catch (error) {
    throw new Error(error.message || "error in calling fast2sms API")
  }
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