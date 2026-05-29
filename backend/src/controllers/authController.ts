import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Otp from '../models/Otp';
import { sendEmailOtp, sendPhoneOtp } from '../services/notificationService';
import { Op } from 'sequelize';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, phoneNumber } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Please provide either an email address or a phone number' });
    }

    // Check if user already exists
    const filter: any[] = [];
    if (username) filter.push({ username });
    if (email) filter.push({ email });
    if (phoneNumber) filter.push({ phoneNumber });

    const existingUser = await User.findOne({
      where: {
        [Op.or]: filter,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username, email, or phone number already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (Grace period is automatically 7 days by default in model definition)
    const user = await User.create({
      username,
      password: hashedPassword,
      email: email || null,
      phoneNumber: phoneNumber || null,
      isVerified: false,
    });

    res.status(201).json({
      message: 'Account created successfully but requires verification within 7 days.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        verificationGraceUntil: user.verificationGraceUntil,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { loginKey, password } = req.body; // Can be username, email or phoneNumber

    if (!loginKey || !password) {
      return res.status(400).json({ error: 'Credentials and password are required' });
    }

    // Find user
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: loginKey },
          { email: loginKey },
          { phoneNumber: loginKey },
        ],
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Account not found' });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Zalo-style: If user is already verified, extend validity by 180 days upon active login
    if (user.isVerified) {
      user.verificationGraceUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
      user.lastWarningSentAt = null;
      await user.save();
    }

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        verificationGraceUntil: user.verificationGraceUntil,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const target = user.email || user.phoneNumber;
    if (!target) {
      return res.status(400).json({ error: 'User has no registered email or phone number' });
    }

    const type = user.email ? 'email' : 'phone';

    // Generate 6-digit code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiration

    // Save to DB
    await Otp.create({
      target,
      code: otpCode,
      type,
      expiresAt,
    });

    // Send Otp
    if (type === 'email') {
      await sendEmailOtp(target, otpCode);
    } else {
      await sendPhoneOtp(target, otpCode);
    }

    res.json({
      message: `Verification code sent to your registered ${type}.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and verification code are required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const target = user.email || user.phoneNumber;
    if (!target) {
      return res.status(400).json({ error: 'User has no registered contact method' });
    }

    // Find valid OTP
    const validOtp = await Otp.findOne({
      where: {
        target,
        code,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      order: [['createdAt', 'DESC']],
    });

    if (!validOtp) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Update User to verified status and extend expiration
    user.isVerified = true;
    user.verificationGraceUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // Extended by 180 days
    user.lastWarningSentAt = null;
    await user.save();

    // Delete used OTP
    await validOtp.destroy();

    res.json({
      message: 'Account verified successfully! Validity extended by 180 days.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        verificationGraceUntil: user.verificationGraceUntil,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
