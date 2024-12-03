/** 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
*/
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('Cooldowns', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        daily: DataTypes.BIGINT,
        weekly: DataTypes.BIGINT,
        crime: DataTypes.BIGINT,
        work: DataTypes.BIGINT,
        rep: DataTypes.BIGINT,
        minerar: DataTypes.BIGINT,
        roleta: DataTypes.BIGINT,
    });

    return User
}