import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return (
      queryInterface.addColumn("Users", "accessWeekdays", {
        type: DataTypes.ARRAY(DataTypes.TIME),
        allowNull: false,
        defaultValue: ["08:00", "18:00"]
      }),
      queryInterface.addColumn("Users", "accessWeekend", {
        type: DataTypes.ARRAY(DataTypes.TIME),
        allowNull: false,
        defaultValue: ["08:00", "18:00"]
      }),
      queryInterface.addColumn("Users", "isActive", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }),
      queryInterface.addColumn("Users", "profileId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Profiles", key: "id" },
        onUpdate: "CASCADE",
        onDelete:"SET NULL"
      })
    );
  },

  down: (queryInterface: QueryInterface) => {
    return (
      queryInterface.removeColumn("Users", "accessWeekdays"),
      queryInterface.removeColumn("Users", "accessWeekend"),
      queryInterface.removeColumn("Users", "isActive"),
      queryInterface.removeColumn("Users", "profileId")
    );
  }
};
