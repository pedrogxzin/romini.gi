const Discord = require('discord.js')
const moment = require('moment')
const { relativeTime } = require('util-stunks');
module.exports = {
    name: "userinfo",
    aliases: ["ui"],
    description: 'Veja as informações de algum usuário do Discord',
    cooldown: 1500,
    usage: null,
    run: async (client, message, args, db) => {
        var user = message.mentions.users.first()
        if(!user) user = await client.users.fetch(args[0]).catch(e => {})
        if(!user) user = message.author
        let member = await message.guild.members.fetch(user.id).catch(e => null)
        const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
        let infos = await fetch(`https://docinho.xyz/api/profile/${user.id}`, {
                method: 'GET',
            }).then(res => res.json())
        let insig = (time) => {
          return {
            1: "<:_:1194820919605084262>",
            [`${Date.parse(moment(time).add('2', 'months'))}`]: "<:_:1194820920808853564>",
            [`${Date.parse(moment(time).add('3', 'months'))}`]: "<:_:1194820922159399034>",
            [`${Date.parse(moment(time).add('6', 'months'))}`]: "<:_:1194820923656781885>",
            [`${Date.parse(moment(time).add('9', 'months'))}`]: "<:_:1194820925204463746>",
            [`${Date.parse(moment(time).add('12', 'months'))}`]: "<:_:1194820926416637974>",
            [`${Date.parse(moment(time).add('15', 'months'))}`]: "<:_:1194820927574265856>",
            [`${Date.parse(moment(time).add('18', 'months'))}`]: "<:_:1194820928664784906>",
            [`${Date.parse(moment(time).add('24', 'months'))}`]: "<:_:1194820929767882792>",
          }
        }
        let list = []
        let flags = user.flags.toArray()
        if (flags.includes('Staff')) list.push('<:_:1194820918346793031>')
        if (flags.includes('Partner')) list.push('<:_:1194820915758899232>')
        if (flags.includes('CertifiedModerator')) list.push('<:_:1194820913271689316>')
        if (flags.includes('Hypesquad')) list.push('<:_:1194820911975628810>')
        if (flags.includes('HypeSquadOnlineHouse3')) list.push('<:_:1194820903914176542>')
        if (flags.includes('HypeSquadOnlineHouse2')) list.push('<:_:1194820906275569774>')
        if (flags.includes('HypeSquadOnlineHouse1')) list.push('<:_:1194820904895655937>')
        if (flags.includes('BugHunterLevel1')) list.push('<:_:1194820907286417448>')
        if (flags.includes('BugHunterLevel2')) list.push('<:_:1194820908402098176>')
        if (flags.includes('ActiveDeveloper')) list.push('<:_:1194820902421020753>')
        if (flags.includes('VerifiedDeveloper')) list.push('<:_:1194820910935441458>')
        if (flags.includes('PremiumEarlySupporter')) list.push('<:_:1194820909693939752>')
        if (flags.includes('VerifiedBot')) list.push('<:verifybot_ms:906991703611809843>') //<:_:1194820914383179786> nitro
        if(infos.premium_type) list.push(`<:Badge_Nitro:1194820914383179786>`)
        if(infos.premium_guild_since) {
          let badge = Object.entries(insig(infos.premium_guild_since)).filter((b) => b[0] <= Date.now()).slice(-1);
          list.push(`${badge[0][1]}`)
        }
        let embed = new Discord.EmbedBuilder()
        .setTitle(`${list.join('')} ${user.globalName || user.username}`)
        .setThumbnail(user.displayAvatarURL())
        .addFields([
            { name: `Nome de usuário`, value: `${user} \`${user.username}\`` },
            { name: `ID`, value: `\`${user.id}\`` },
            { name: `Entrou no Discord em`, value: `<t:${parseInt(user.createdAt / 1000)}>` }
        ])
        if(member) embed.addFields([{ name: `Entrou no servidor em`, value: `<t:${parseInt(member.joinedAt / 1000)}>` }])
        if(infos.premium_guild_since) {
            let a = new Date(infos.premium_guild_since).getTime()
            let badge = Object.entries(insig(infos.premium_guild_since)).filter((b) => b[0] < Date.now()).slice(-1);
            let pbadge = Object.entries(insig(infos.premium_guild_since))[Object.entries(insig(infos.premium_guild_since)).findIndex((x) => x[0] == badge[0][0]) + 1];
            let boosted = moment(a - 10800000).format("LLL")
            embed.addFields([
                { name: `Impulsionando servidor desde`, value: `${boosted} (${relativeTime(a, { display: 3 })})` },
                { name: `Impulso`, value: `${badge[0][1]} (${relativeTime(a, { display: 3 })}})`, inline: true }
            ])
            if(pbadge) embed.addFields({ name: 'Próximo Up', value: `${pbadge[1]} (em ${relativeTime(pbadge[0], { display: 3 })})`, inline: true})
        }
        embed.setTimestamp()
        message.reply({ embeds: [embed] })
    }
}