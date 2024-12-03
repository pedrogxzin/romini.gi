/** 
 * @param {import('sequelize').Sequelize} sequelize 
 * @param {import('sequelize').DataTypes} DataTypes 
*/
module.exports = (sequelize, DataTypes) => {
    const Plantas = sequelize.define('Plantas', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        girassol: {
            type: DataTypes.BIGINT,
            defaultValue: null
        },
        rosa: {
            type: DataTypes.BIGINT,
            defaultValue: null
        },
        hera: {
            type: DataTypes.BIGINT,
            defaultValue: null
        },
        margarida: {
            type: DataTypes.BIGINT,
            defaultValue: null
        },
        cacto: {
            type: DataTypes.BIGINT,
            defaultValue: null
        },
        monstera: {
            type: DataTypes.BIGINT,
            defaultValue: null
        },
    });

    return Plantas
}