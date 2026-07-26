const jwt = require('jsonwebtoken');
const User = require('../models/user');
const RefreshToken = require('../models/RefreshToken');

exports.createUser = async (data) => {
  return await User.create(data);
};

exports.sendOtp = async (mobile) => {
  try {
    const userData = await User.findOne({ where: { mobile: mobile } });
    console.log("userData", userData)
    if (!userData) {
      throw new Error("User not found");
    }
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

exports.verifyOtp = async (mobile, otp) => {
  try {
    if (!mobile || !otp) {
      throw new Error("Mobile number and OTP are required");
    }
    if (otp !== "123456") { // Replace with actual OTP verification logic
      throw new Error("Invalid OTP");
    }

    const userData = await User.findOne({ where: { mobile: mobile } });
    console.log("userData", userData)
    if (!userData) {
      throw new Error("User not found");
    }

    const data = await generateAndStoreTokens(userData);


    return data; // Placeholder implementation

  } catch (error) {
    throw new Error(`error :: ${error.message}` || "Error in verifying OTP");
  }
}

exports.refreshTokens = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    const data = await handleRefreshToken(refreshToken);
    console.log("data from refreshTokens data", data)
    return data; // Placeholder implementation

  } catch (error) {
    throw new Error(`error :: ${error.message}` || "Error in refreshing tokens");
  }
}


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

const generateAndStoreTokens = async (user) => {
  try {
    const payload = {
      userId: user.id,
      role: user.role || 'merchant',
      phone: user.phone,
    };

    // 2. Short-Lived Access Token (15 मिनट)
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });

    // 3. Long-Lived Refresh Token (365 दिन)
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '365d' }
    );

    // 4. Sequelize Upsert Logic (अगर टोकन पहले से है तो अपडेट होगा, नहीं तो नया बनेगा)
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 दिन

    const existingToken = await RefreshToken.findOne({ where: { userId: user.id } });

    if (existingToken) {
      // अगर DB में पहले से रिकॉर्ड है -> अपडेट करो
      await existingToken.update({
        token: refreshToken,
        expiresAt: expiresAt,
      });
    } else {
      // नया रिकॉर्ड बनाओ
      await RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiresAt: expiresAt,
      });
    }

    // 5. HttpOnly Cookies सेट करना
    const isProduction = process.env.NODE_ENV === 'production';

    // // Access Token Cookie
    // res.cookie('accessToken', accessToken, {
    //   httpOnly: true, // JS से एक्सेस ब्लॉक
    //   secure: isProduction,
    //   sameSite: 'strict',
    //   path: '/',
    //   maxAge: 15 * 60 * 1000, // 15 मिनट
    // });

    // // Refresh Token Cookie
    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: isProduction,
    //   sameSite: 'strict',
    //   path: '/', // या सुरक्षा के लिए '/api/auth/refresh'
    //   maxAge: 365 * 24 * 60 * 60 * 1000, // 365 दिन
    // });

    return {
      success: true,
      user: {
        id: user.id,
        phone: user.mobile,
        role: user.role,
        refreshToken,
        accessToken
      },
    };
  } catch (error) {
    console.error('User Service Token Error:', error);
    throw error;
  }

}

const handleRefreshToken = async (refreshToken) => {
  try {
    // 2. Refresh Token ko verify karein
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    return jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        throw new Error('Refresh token is invalid or has expired');
      }

      // 3. Naya Access Token generate karein
      const newAccessToken = jwt.sign(
        { userId: decoded.userId, role: decoded.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      return { success: true, message: 'Token Refreshed Successfully', accessToken: newAccessToken };
    });
  } catch (error) {
    throw new Error(`${error.message}` || "Error in refreshing tokens");
  }
}