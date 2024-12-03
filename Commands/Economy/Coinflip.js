const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { abbreviate, unabbreviate } = require('util-stunks');

const { createCanvas, loadImage, registerFont } = require("canvas");
const { fillTextWithTwemoji } = require("node-canvas-with-twemoji-and-discord-emoji");

registerFont('./Base/Fonts/font.ttf', { family: 'Frutiger' });
module.exports = {
    name: 'coinflip',
    aliases: ['cf', 'caracoroa', 'cc'],
    description: 'Rode a moeda',
    cooldown: 1500,
    usage: '[choice] <valor>',
    run: async (client, message, args) => {
        if (args.length < 2) {
            return await message.reply({ content: `Por favor, forneça uma escolha e um valor de aposta.` });
        }

        const amount = Math.floor(unabbreviate(String(args[1])));

        if (!amount || isNaN(amount)) {
            return await message.reply({ content: `Digite um valor válido!` });
        }

        if (amount > 10_000_000_000) {
            return await message.reply({ content: `O limite de aposta do coinflip é de 10M` });
        }

        if (!(await userHasMoney(client, message.author.id, amount, message))) {
            return;
        }

        await client.mysql.updateUserMoney(message.author.id, -amount);

        const coinflip = Math.floor(Math.random() * 2);
        let result = (args[0].toLowerCase() === "cara") ? 0 : 1;

        if (coinflip === result) {
            await message.reply({
                content: `<@${message.author.id}> Você apostou **${amount} (${abbreviate(amount)})** em **${args[0]}** \n **Parabéns!** Você jogou em **${args[0]}** e o resultado foi **${args[0]}**.`
            });
            await client.mysql.updateUserMoney(message.author.id, amount * 2);
        } else {
            const lostResult = coinflip === 0 ? "cara" : "coroa";
            await message.reply({
                content: `<@${message.author.id}> Você apostou **${amount} (${abbreviate(amount)})** em **${args[0]}** \n **Que pena!** Você jogou em **${args[0]}** e o resultado foi **${lostResult}** sendo assim você perdeu.`
            });
        }
    }
};

async function userHasMoney(client, UserId, valueToCompare, message) {
    const AuthorData = await client.mysql.findUser(UserId, true);

    if (AuthorData.money < valueToCompare) {
        await client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, como patrocinador, você não possui essa quantidade de Ametistas.`
        });
        return false;
    }
    return true;
}
