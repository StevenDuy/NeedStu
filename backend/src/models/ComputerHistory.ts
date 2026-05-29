import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import User from './User';

export class ComputerHistory extends Model {
  public id!: number;
  public userId!: number | null;
  public action!: string;
  public deviceName!: string;
  public ipAddress!: string;
  public details!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ComputerHistory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    deviceName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING(45), // Supports IPv4 & IPv6
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'computer_histories',
  }
);

// Define relations (Associations)
User.hasMany(ComputerHistory, { foreignKey: 'userId', as: 'histories' });
ComputerHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default ComputerHistory;
