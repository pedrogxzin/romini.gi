const Discord = require('discord.js')
module.exports = {
    name: 'shop',
    aliases: ['loja'],
    description: 'Shop',
    cooldown: 1900,
    usage: null,
    run: async (client, message, args) => {
        let items = {
            'Picaretas': {
                'Picareta de Madeira': 10000000,
                'Picareta de Pedra': 30000000,
                'Picareta de Ferro': 65000000,
                'Picareta de Ouro': 21000000,
                'Picareta de Diamante': 450000000,
                'Picareta de Netherita': 900000000,
            }
        }
        let embed = new Discord.EmbedBuilder()
        .setTitle('🛒 Loja de itens')
        .setColor("Orange")
        for(let [obj, itm] of Object.entries(items)) {
            embed.addFields([{ name: obj, value: Object.entries(itm).map(item => `**${item[0]}**: 🧪 **${(item[1]).toLocaleString()}**`).join('\n') }])
        }
        let menu = new Discord.StringSelectMenuBuilder().setCustomId('item').setPlaceholder('Selecione um item para comprar')
        let opts = []
        for(let obj of Object.values(items)) {
                for(let item of Object.entries(obj)) {
                    opts.push({
                        label: item[0],
                        description: `Valor: 🧪 ${(item[1]).toLocaleString()}`,
                        value: item[0]
                    })
                }
        }
        menu.setOptions(opts)
        message.reply({ embeds: [embed], components: [new Discord.ActionRowBuilder().addComponents(menu)] }).then(msg => {
            let filter = (i) => i.user.id == message.author.id
            let collector = msg.createMessageComponentCollector({ filter, idle: 180000 })
            collector.on('collect', async (i) => {
                const Data = await client.mysql.findUser(message.author.id, true)
                let item
                if(i.values[0].includes('Picareta')) item = items['Picaretas'][i.values[0]]
                if(Data.money < item) return i.reply({ content: `:x: Você não possui poções o suficiente para comprar este item!`, ephemeral: true })
                if(Data.picareta == i.values[0]) return i.reply({ content: `:x: Você já possui essa picareta!`, ephemeral: true })
                await client.mysql.query(`UPDATE Users SET money=money-'${item}',picareta='${i.values[0]}' WHERE id='${message.author.id}' LIMIT 1`)
                return i.reply({ content: `Você comprou **${i.values[0]}** por **${(item).toLocaleString()} Poções**!`})
            })
        })
    }
}