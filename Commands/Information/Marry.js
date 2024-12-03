const { relativeTime } = require('util-stunks');
const Discord = require('discord.js')
module.exports = {
    name: "marry",
    aliases: ["casar"],
    description: 'Case com outro usuário',
    cooldown: 1200,
    usage: null,
    run: async (client, message, args) => {
        var user = await client.util.FindUser(args[0], client, message, false)
        let data = await client.mysql.findUser(message.author.id, true)
        if (args[0] == 'info') {
            user = await client.util.FindUser(args[1], client, message, false)
            if(!user) user = message.author
            data = await client.mysql.findUser(user.id, true)
            let time = data.marriedtime
            if(!time) return client.sendReply(`${client.config.emojis.error} ${user.id == message.author.id ? 'Você' : user} não está casado(a)!`)
            let married = await client.users.fetch(data.marrieduser)
            client.sendReply(message, {
                embeds: [new Discord.EmbedBuilder()
                    .setAuthor({
                        name: user.displayName,
                        iconURL: user.displayAvatarURL()
                    })
                    .setDescription(`Casado com: ${married.displayName} (${relativeTime(time)})`)
                    .setFooter({
                        text: `Não use bdivorciar`
                    })
                ]
            })
            return
        }
        if(data.marrieduser) return client.sendReply(message, `${client.config.emojis.error} Você já está casado!`)
        if (!user) {
            client.sendReply(message, `${client.config.emojis.error} ${message.author} Você deve mencionar um usuário para se casar!`)
            return
        }
        if (user.id == message.author.id) {
            client.sendReply(message, `${client.config.emojis.error} ${message.author} Você não pode casar com você mesmo!`)
            return
        }
        if (user.bot) {
            client.sendReply(message, `${client.config.emojis.error} ${message.author} Você não pode se casar com bots!`)
            return
        }
        let datauser = await client.mysql.findUser(user.id, true)
        if (datauser.married) {
            client.sendReply(message, `${client.config.emojis.error} ${message.author} Usuário já está casado!`)
            return
        }
        let msg = await message.channel.send(`${user}, ${message.author} Quer se casar com você! Aceita?\n*Os 2 usuários devem clicar em* 💍`)
        await msg.react(`💍`)
        const filter = (r, u) => r.emoji.name === '💍' && u.id === message.author.id || r.emoji.name === '💍' && u.id === user.id
        const collector = msg.createReactionCollector({
            filter,
            time: 60000
        })
        let sucesso = false
        let users
        collector.on('collect', (r, u) => {
            if (sucesso) return collector.stop('sucess')
            if (!msg) return collector.stop('erro')
            users = msg?.reactions?.cache?.get('💍')?.users?.cache?.map(u => u.id)
            if (!users) return
            if (users.includes(message.author.id) && users.includes(user.id)) {
                sucesso = true
                collector.stop('sucess')
            }
        })
        collector.on('end', async (collected, motivo) => {
            datauser = await client.mysql.findUser(user.id, true)
            data = await client.mysql.findUser(message.author.id, true)
            if (data.marrieduser) return message.channel.send(`${client.config.emojis.error} ${message.author} Você já está casado!`)
            if (datauser.married) return message.channel.send(`${client.config.emojis.error} ${message.author} Usuário já está casado!`)
            if (motivo == 'sucess') {
                await client.mysql.updateUser(message.author.id, { marrieduser: user.id, marriedtime: Date.now() })
                await client.mysql.updateUser(user.id, { marrieduser: message.author.id, marriedtime: Date.now() })
                client.sendReply(message, `💍 ${user}, ${message.author} Parabéns, vocês se casaram!`)
            }
        })
    }
}