const Discord = require('discord.js')
const moment = require('moment')
const { relativeTime } = require('util-stunks');
module.exports = {
    name: "serverinfo",
    aliases: [""],
    description: 'Veja as informações de algum servidor do Discord',
    cooldown: 2000,
    usage: null,
    run: async (client, message, args) => {
        let guild = client.guilds.cache.get(args[1])
        if(!guild) guild = message.guild
        await guild.members.fetch()
        let members = {
            count: guild.memberCount,
            users: guild.members.cache.filter(u => !u.user.bot).size,
            bots: guild.members.cache.filter(u => u.user.bot).size
        }
        let channels = {
            count: guild.channels.cache.size,
            textCount: guild.channels.cache.filter(u => [0, 5].includes(u.type)).size,
            threadCount: guild.channels.cache.filter(u => [12, 11, 10].includes(u.type)).size,
            categoryCount: guild.channels.cache.filter(u => u.type == 4).size,
            voiceCount: guild.channels.cache.filter(u => [2, 13].includes(u.type)).size
        }
        let infos = { members, channels }
        let embed = new Discord.EmbedBuilder()
        .setTitle(guild.name)
        if(guild.icon) embed.setThumbnail(client.rest.cdn.icon(guild.id, guild.icon, {}))
        embed.addFields({ name: `Membros`, value: `**Total**: ${(infos.members.count).toLocaleString('pt')}/${(guild.maximumMembers).toLocaleString('pt')}\n**Usuários**: ~${(infos.members.users).toLocaleString('pt')}\n**Bots**: ~${(infos.members.bots).toLocaleString('pt')}`, inline: true})
        embed.addFields({ name: `Canais`, value: `**Total:** ${infos.channels.count}\n**Texto:** ${infos.channels.textCount}\n**Voz:** ${infos.channels.voiceCount}\n**Threads**: ${infos.channels.threadCount}\n**Categorias**: ${infos.channels.categoryCount}`, inline: true})
        let roles = guild.roles.cache.size
        let createdAt = guild.createdTimestamp
        let guildDescription = guild.description ? `${guild.description}\n\n` : ''
        let owner = await client.users.fetch(guild.ownerId)
        embed.setDescription(`${guildDescription}**ID**: ${guild.id}\n**Posse**: \`${owner.username}\` (${owner.id})\n**Data de criação**: ${moment(createdAt-10800000).format('LL, à\\s HH:mm')}\n**Cargos**: ${roles}`)
        message.reply({ embeds: [embed] })
    }
}