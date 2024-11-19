import {
  Table,
  Column,
  Model,
  ForeignKey,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";
import User from "./User";
import Queue from "./Queue";

@Table
class SupervisorQueue extends Model<SupervisorQueue> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default SupervisorQueue;
