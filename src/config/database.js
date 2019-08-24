module.exports = {
  dialect: 'postgres',
  hostname: 'localhost',
  database: 'meetapp',
  username: 'postgres',
  password: 'docker',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
