import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Otp extends Model {
  public id!: number;
  public target!: string; // Email or phone number
  public code!: string;
  public type!: 'email' | 'phone';
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Otp.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    target: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('email', 'phone'),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'otps',
  }
);

export default Otp;
