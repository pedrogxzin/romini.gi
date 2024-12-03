const Discord = require('discord.js')
const mss = require('ms')
const { abbreviate, relativeTime } = require('util-stunks')
module.exports = {
    name: 'crime',
    aliases: [''],
    description: 'Cometa um crime',
    cooldown: 1000,
    usage: null,
    run: async (client, message, args) => {
        const Cooldown = await client.mysql.getCooldowns(message.author.id, true);
        if (Cooldown.crime > Date.now()) return client.sendReply(message, {
            content: `${client.config.emojis.clock} ${message.author}, espere \`${relativeTime(Cooldown.crime, { display: 2 })}\` para dar reputações novamente.`
        })
        let minAmount = 1000000
        let maxAmount = 8000000
        let cooldown = mss('30m')
        var newMoney = parseInt(Math.random() * (maxAmount - minAmount)) + minAmount
        var crimes = ["uma lanchonete", "um supermercado", "uma loja de roupas", "uma peixaria", "um restaurante", "um bar", "uma padaria", "um açougue", "uma barbearia", "uma farmácia", "um sacolão", "um shopping"]
        var randcrimes = Math.floor(Math.random() * crimes.length)
        const embed = new Discord.EmbedBuilder()
            .setTitle("**Crime**")
            .setDescription("{user} assaltou {crime} e conseguiu roubar {amount}! \nRetorne em {time} para cometer crimes novamente.".replace('{user}', `**${message.author.username}**`).replace('{crime}', `**${crimes[randcrimes]}**`).replace('{amount}', `**${newMoney.toLocaleString()} Poções**`).replace('{time}', `20 minutos`))
            .setColor('Orange')
            await client.mysql.updateCooldowns(message.author.id, 'crime', (Date.now() + cooldown))
        client.mysql.updateUserMoney(message.author.id, newMoney)
        await client.mysql.transactions.create({
            source: 14,
            received_by: message.author.id,
            received_by_tag: message.author.tag,
            given_at: Date.now(),
            amount: newMoney
        })

        message.reply({
            embeds: [embed]
        }).catch(_ => {})
    }
}