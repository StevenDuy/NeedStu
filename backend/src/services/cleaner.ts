import { Op } from 'sequelize';
import User from '../models/User';
import { sendExpirationWarningEmail } from './notificationService';

export const runDatabaseCleanup = async () => {
  const now = new Date();
  console.log('[Cleaner]: Database cleanup task initiated at', now.toISOString());

  try {
    // 1. Delete unverified users whose initial 7-day grace period has expired
    const deletedUnverifiedCount = await User.destroy({
      where: {
        isVerified: false,
        verificationGraceUntil: {
          [Op.lt]: now,
        },
      },
    });

    if (deletedUnverifiedCount > 0) {
      console.log(`[Cleaner]: Cleaned up ${deletedUnverifiedCount} unverified accounts due to verification deadline.`);
    }

    // 2. Delete verified users who missed the 180-day periodic check-in/verification
    const deletedExpiredCount = await User.destroy({
      where: {
        isVerified: true,
        verificationGraceUntil: {
          [Op.lt]: now,
        },
      },
    });

    if (deletedExpiredCount > 0) {
      console.log(`[Cleaner]: Deleted ${deletedExpiredCount} expired active accounts due to inactivity.`);
    }

    // 3. Send warning emails to verified users expiring within the next 2 days
    const warningThreshold = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
    const usersToWarn = await User.findAll({
      where: {
        isVerified: true,
        verificationGraceUntil: {
          [Op.between]: [now, warningThreshold],
        },
        lastWarningSentAt: null, // Only send warning once
        email: {
          [Op.ne]: null,
        },
      },
    });

    for (const user of usersToWarn) {
      if (user.email) {
        const timeLeftMs = new Date(user.verificationGraceUntil).getTime() - now.getTime();
        const daysLeft = Math.ceil(timeLeftMs / (1000 * 60 * 60 * 24));

        await sendExpirationWarningEmail(user.email, daysLeft);
        user.lastWarningSentAt = now;
        await user.save();
        console.log(`[Cleaner]: Sent expiration warning to ${user.username} (${user.email}). Expiring in ${daysLeft} days.`);
      }
    }
  } catch (error) {
    console.error('[Cleaner Error]: Periodic database cleanup failed:', error);
  }
};

export const initCleanerTask = () => {
  // Execute database cleanup immediately on start
  runDatabaseCleanup();

  // Run cleanup every 1 hour (3600000 milliseconds)
  setInterval(() => {
    runDatabaseCleanup();
  }, 60 * 60 * 1000);
};
