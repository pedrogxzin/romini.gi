const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { readdirSync } = require("fs");

module.exports = {
    name: 'invite',
    aliases: ['invite'],
    description: 'Obtenha a velocidade de respota e latência da aplicação.',
    cooldown: 1200,
    usage: null,
    run: async (client, message, args) => {
        const Row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setURL(client.config.links.invitation_url)
                .setStyle(ButtonStyle.Link)
                .setLabel('Convite')
                .setEmoji(client.config.emojis.money),
            new ButtonBuilder()
                .setURL(client.config.links.official_guild)
                .setStyle(ButtonStyle.Link)
                .setLabel('Servidor Oficial')
        )

        client.sendReply(message, {
            components: [Row],
            content: `${message.author.toString()}, para me adicionar no seu servidor, clique no botão abaixo.

> **Atualmente Estou em \`${client.guilds.cache.size.toLocaleString('de-DE')} Servidores\`.**`
        })
    }
}