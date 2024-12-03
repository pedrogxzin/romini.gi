const Discord = require('discord.js')
module.exports = {
    name: "addemoji",
    cooldown: "2s",
    aliases: ["addemojis"],
    description: 'Adicione um ou mais emojis no servidor',
    cooldown: 1200,
    usage: null,
    run: async (client, message, args) => {
        if(!message.member.permissions.has('ManageEmojisAndStickers')) return message.reply(`:x: Você deve possuir a permissão de \`Gerenciar emojis e figurinhas\` para adicionar novos emojis!`)
        if(!message.guild.members.me.permissions.has('ManageEmojisAndStickers')) return message.reply(`:x: Eu preciso da permissão de \`Gerenciar emojis e figurinhas\` para adicionar novos emojis!`)
        if(args.length == 0) return message.reply(`:x: Você deve inserir pelo menos 1 emoji para adicionar!`)
        let emojislimit = message.guild.premiumTier == 0 ? 100 : message.guild.premiumTier == 1 ? 200 : message.guild.premiumTier == 2 ? 300 : 500
        var msg = await message.channel.send(`${message.author} Adicionando emojis...`)
        var emojis = []
        for (const arg of args) {
            const emoji = Discord.parseEmoji(arg)
            if(emoji.id) {
                const emojiExt = emoji.animated ? '.gif' : '.png'
                const emojiUrl = `https://cdn.discordapp.com/emojis/${emoji.id}${emojiExt}`
                let newEmoji;
                try {
                    newEmoji = await message.guild.emojis.create({ attachment: emojiUrl, name: emoji.name })
                    emojis.push(`${newEmoji}`)
                } catch (e) {
                    if(e.code == 30008) message.channel.send(`:x: ${message.author} O limite de emojis (${emojislimit}) foi atingido!`)
                    else message.channel.send(`:x: Ocorreu um erro ao adicionar o emoji!`) && client.emit('error', e)
                }
            }
        }
        if(emojis.length > 0) msg.edit(`✅ ${message.author} Você adicionou os emojis: ${emojis.join(' ')}`)
        else msg.edit(`:x: Ooops. Por algum motivo os emojis não foram adicionados.`)
    }
}