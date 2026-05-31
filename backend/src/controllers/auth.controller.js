const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const buildUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  picture: user.picture,
});

const signToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: 'Missing credential',
    });
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Authentication is not configured',
    });
  }

  let payload;

  try {
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    payload = ticket.getPayload();

    if (!payload?.email || !payload?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token',
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Google token',
    });
  }

  try {
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        picture: payload.picture,
      });
    } else if (!user.googleId || user.googleId === payload.sub) {
      user.name = payload.name || user.name;
      user.googleId = user.googleId || payload.sub;
      user.picture = payload.picture || user.picture;
      await user.save();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token',
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  googleLogin,
  getProfile,
};
