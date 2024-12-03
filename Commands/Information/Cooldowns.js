const Discord = require('discord.js')
const { relativeTime } = require('util-stunks');
module.exports = {
    name: "cooldowns",
    cooldown: "2s",
    aliases: ["cooldown", "cd", "cds"],
    description: 'Veja seus comandos pendentes',
    cooldown: 200,
    usage: null,
    run: async (client, message, args) => {
        var user = await client.util.FindUser(args[0], client, message, false)
        if(!user) user = message.author
        const Data = await client.mysql.getCooldowns(user.id, true);
        let cooldowns = {
            daily: Data.daily,
            weekly: Data.weekly,
            crime: Data.crime,
            work: Data.work,
            rep: Data.rep
        }
        let cd = {
            daily: cooldowns.daily < Date.now() ? 'Pronto para uso' : `${relativeTime(cooldowns.daily, { display: 2 })}`,
            weekly: cooldowns.weekly < Date.now() ? 'Pronto para uso' : `${relativeTime(cooldowns.weekly, { display: 2 })}`,
            crime: cooldowns.crime < Date.now() ? 'Pronto para uso' : `${relativeTime(cooldowns.crime, { display: 2 })}`,
            work: cooldowns.work < Date.now() ? 'Pronto para uso' : `${relativeTime(cooldowns.work, { display: 2 })}`,
            rep: cooldowns.rep < Date.now() ? 'Pronto para uso' : `${relativeTime(cooldowns.rep, { display: 2 })}`,
        }
        let embed = new Discord.EmbedBuilder()
        .setTitle(`Cooldowns de ${user.username}`)
        .setDescription(Object.entries(cd).map(i => `${i[1].includes('Pronto') ? '✅': `${client.config.emojis.clock}`} \`${i[0]}\`: **${i[1]}**`).join('\n'))
        .setColor('Orange')
        message.reply({ embeds: [embed] })
    }
}