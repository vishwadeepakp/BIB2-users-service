const jwt = require('jsonwebtoken');
const User = require('../models/user');
const RefreshToken = require('../models/RefreshToken');
const { sendMessage } = require('../config/kafkaClient');

const otpStore = new Map();

exports.createUser = async (data) => {
  try {
    const user = await User.create(data);
    return { success: true, message: 'User created successfully', data: user };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(error?.message || 'Failed to create user');
  }
};

exports.sendOtp = async (payload) => {
  try {
    const mobile = payload?.mobile || payload?.phone;
    let email = payload?.email;
    const isRegistration = Boolean(payload?.isRegistration);

    if (!isRegistration) {
      const userData = await User.findOne({ where: { mobile: mobile } });
      console.log("userData", userData);
      if (!userData) {
        throw new Error("User not found");
      }
      email = email || userData?.email;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 मिनट
    const otpKey = mobile?.toString();

    otpStore.set(otpKey, { otp, expiresAt });

    console.log("otpStore", otpStore, email)

    // await triggerOtpEvent('EMAIL', email, otp);

    return { success: true, message: 'OTP sent successfully' };

    // const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": process.env.OTP_KEY,
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({
    //     route: "q",
    //     language: 'english',
    //     number: mobile,
    //     message: `Your OTP is ${otp}. Please do not share it with anyone.`
    //   })
    // });

    // const data = await response.json();

    // if (!response.ok) {
    //   throw new Error(data.message || "error in calling fast2sms API")
    // }
    // return data

  } catch (error) {
    throw new Error(error.message || "error in calling fast2sms API")
  }
};

exports.verifyOtp = async (mobile, otp, isRegistration) => {
  try {
    const normalizedMobile = mobile?.toString();
    if (!normalizedMobile || !otp) {
      throw new Error("Mobile number and OTP are required");
    }

    const savedOtp = otpStore.get(normalizedMobile);
    console.log("savedOtp", savedOtp, "otp", otp, "mobile", normalizedMobile, otpStore)
    if (!savedOtp || savedOtp.otp !== otp || savedOtp.expiresAt < Date.now()) {
      throw new Error("Invalid or expired OTP");
    }

    otpStore.delete(normalizedMobile);
    if (!isRegistration) {
      const userData = await User.findOne({ where: { mobile: normalizedMobile } });
      console.log("userData", userData);
      if (!userData) {
        throw new Error("User not found");
      }
      const data = await generateAndStoreTokens(userData);
      return data;
    } else {
      return { success: true, message: 'OTP verified successfully' };
    }

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

const triggerOtpEvent = async (channel, recipient, otp) => {
  try {
    const payload = {
      channel: channel,     // 'EMAIL' या 'SMS'
      recipient: recipient, // 'user@gmail.com' या '+919876543210'
      otp: otp,
      timestamp: new Date().toISOString()
    };

    // Kafka के 'send-otp' टॉपिक में मैसेज पुश करें
    await sendMessage('send-otp', {
      key: recipient,
      value: JSON.stringify(payload),
    });

    console.log(`✅ [Kafka Event Sent] OTP Event queued for ${recipient} via ${channel}`);

  } catch (error) {
    console.error("❌ Failed to push event to Kafka:", error.message);
    throw error;
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