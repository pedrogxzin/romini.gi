const Discord = require('discord.js')
const { abbreviate, relativeTime } = require('util-stunks')
const ms = require("ms");
module.exports = {
    name: "plantar",
    aliases: [""],
    description: '',
    cooldown: 2000,
    usage: '',
    run: async (client, message, args) => {
        let data = await client.mysql.plantas.findOrCreate({
            where: {
                id: message.author.id
            }
        }).then(Data => Data[0].dataValues)
        let menu = new Discord.StringSelectMenuBuilder().setCustomId('plantas').setPlaceholder(`Veja o seu plantio`)
        let embed = new Discord.EmbedBuilder()
        .setTitle(`Plantío de ${message.author.username}`)
        .setColor('Orange')
        let opts = []
        for(let [key, value] of Object.entries(data).filter(a => ['monstera','cacto','margarida','hera','rosa','girassol'].includes(a[0]))) {
            let valores = {
                'monstera': 100000000,
                'cacto': 70000000,
                'margarida': 50000000,
                'hera': 40000000,
                'rosa': 20000000,
                'girassol': 15000000,
            }
            if(Date.now() < value) {
                opts.push({
                    label: `${key.slice(0,1).toUpperCase()}${key.slice(1, 10)}`,
                    emoji: '🕓',
                    description: `Disponível para coletar em ${relativeTime(value)}`,
                    value: key
                })
                embed.addFields([{ name: `🕓 ${key.slice(0,1).toUpperCase()}${key.slice(1, 10)}`, value: `Disponível para coletar em ${relativeTime(value)}` }])
            }
            else if(Date.now() > value && value) {
                opts.push({
                    label: `${key.slice(0,1).toUpperCase()}${key.slice(1, 10)}`,
                    emoji: '🌿',
                    description: `Disponível para coleta!`,
                    value: key
                })
                embed.addFields([{ name: `🌿 ${key.slice(0,1).toUpperCase()}${key.slice(1, 10)}`, value: `Disponível para coleta!` }])
            }
            else {
                opts.push({
                    label: `${key.slice(0,1).toUpperCase()}${key.slice(1, 10)}`,
                    emoji: '🌿',
                    description: `Plantar ${key} por ${(valores[key]).toLocaleString()} poções`,
                    value: key
                })
                embed.addFields([{ name: `🌿 ${key.slice(0,1).toUpperCase()}${key.slice(1, 10)}`, value: `Plantar ${key} por ${(valores[key]).toLocaleString()} poções` }])
            }
        }
        menu.setOptions(opts)
        message.reply({ embeds: [embed], components: [new Discord.ActionRowBuilder().addComponents(menu)] }).then(msg => {
            let filter = (i) => i.user.id == message.author.id
            let collector = msg.createMessageComponentCollector({ filter, idle: 120000 })
            collector.on('collect', async (i) => {
                data = await client.mysql.plantas.findOrCreate({
                    where: {
                        id: message.author.id
                    }
                }).then(Data => Data[0].dataValues)
                const Data = await client.mysql.findUser(message.author.id, true)
                let [key, value] = Object.entries(data).find(x => x[0] == i.values[0])
                if(Date.now() < value) return i.reply({ content: `🕓 Você poderá coletar **${key}** em ${relativeTime(value)}`, ephemeral: true })
                else if(Date.now() > value && value) {
                    let valores = {
                        'monstera': 250000000,
                        'cacto': 125000000,
                        'margarida': 80000000,
                        'hera': 60000000,
                        'rosa': 30000000,
                        'girassol': 20000000,
                    }
                    let valor = valores[key]
                    await client.mysql.updateUserMoney(i.user.id, valor)
                    await client.mysql.plantas.update({
                        [key]: null
                    }, {
                        where: {
                            id: i.user.id
                        }
                    })
                    return i.reply({ content: `🌿 Você coletou **${key}** e recebeu **${(valor).toLocaleString()} Poções**`, ephemeral: true  })
                }
                else {
                    let valores = {
                        'monstera': 100_000_000,
                        'cacto': 70_000_000,
                        'margarida': 50_000_000,
                        'hera': 40_000_000,
                        'rosa': 20_000_000,
                        'girassol': 15_000_000,
                    }
                    if(valores[key] > Data.money) return i.reply({ content: `:x: Você não possui poções o suficiente para plantar **${key}**!`, ephemeral: true })
                    let cooldowns = {
                        'monstera': ms('1h') + ms('40m'),
                        'cacto': ms('1h') + ms('20m'),
                        'margarida': ms('50m'),
                        'hera': ms('35m'),
                        'rosa': ms('25m'),
                        'girassol': ms('15m'),
                    }
                    let cooldown = cooldowns[key]
                    await client.mysql.plantas.update({
                        [key]: Date.now() + cooldown
                    }, {
                        where: {
                            id: i.user.id
                        }
                    })
                    let valor = parseInt(valores[key])
                    await client.mysql.updateUserMoney(i.user.id, -valor)
                    return i.reply({ content: `🌿 Você plantou **${key}** por **${valor.toLocaleString()}** poções, retorne novamente em **${relativeTime(Date.now() + cooldown)}** para coleta.` })
                }
            })
        })
    }
}