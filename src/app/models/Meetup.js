import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        user_id: Sequelize.INTEGER,
        file_id: Sequelize.INTEGER,
        localization: Sequelize.STRING,
        date: Sequelize.DATE,
      },
      { sequelize }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'file_id', as: 'banner' });
    this.belongsTo(models.User, { foreignKey: 'file_id', as: 'organizer' });
  }
}

export default Meetup;
