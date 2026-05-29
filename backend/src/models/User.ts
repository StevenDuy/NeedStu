import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string | null;
  public phoneNumber!: string | null;
  public password!: string;
  public isVerified!: boolean;
  public verificationGraceUntil!: Date;
  public lastWarningSentAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verificationGraceUntil: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from registration
    },
    lastWarningSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;
