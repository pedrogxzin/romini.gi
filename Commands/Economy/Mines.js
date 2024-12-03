const Discord = require('discord.js')
module.exports = {
    name: "mine",
    aliases: ["mines"],
    description: 'Aposte no mines.',
    cooldown: 2000,
    usage: '<valor>',
    run: async (client, message, args) => {
        let prefix = 'b'
        function f(n) {
            let resultado = n
            for (var i = 1; i < n; i++) {
              resultado *= i;
            }
            return resultado
        }
        function fact(n,r) {
            if(n == r) return 1
            let a = f(n) / f(r) 
            return Math.ceil(a / f(n-r))
        }
        function cal_mult(diamonds) {
            return (fact(25, diamonds) / fact(25 - 2, diamonds)) - (0.15 * (diamonds/2)) - (diamonds > 16 ? 1.4 * (diamonds - 16) : 0)
        }
        let buttons = []
        let countBombs = 3
        let diamantes = 22
        let valor = args[0]
        if (!valor) return message.reply(`:x: Você precisa inserir um valor!\nModo de usar: \`${prefix}mines <valor>\``)
        const Data = await client.mysql.findUser(message.author.id, true)
        var money = Data.money
        if(args[0].toLowerCase() == 'half') {
            valor = Math.floor(money / 2)
            if(valor > 100_000_000_000_000_000) Value = 100_000_000_000_000_000
        }

        if(args[0].toLowerCase() == 'all') {
            valor = Math.floor(money)
            if(valor > 100_000_000_000_000_000) Value = 100_000_000_000_000_000
        }

        if (isNaN(valor) || valor < 0 || valor > 100_000_000_000_000_000) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, digite um valor número acima de **10 poções** para apostar.`
        })
        if (valor > 500000) valor = 500000
        valor = parseInt(valor)
        client.mysql.updateUserMoney(message.author.id, -valor)
        await client.mysql.transactions.create({
            source: 10,
            given_by: message.author.id,
            given_by_tag: message.author.tag,
            given_at: Date.now(),
            amount: valor
        })
        var multiplicador = 0
        let proxm = cal_mult(1).toFixed(4)
        let ativado = false
        let button = (s) => new Discord.ButtonBuilder()
        .setLabel('\u200b')
        .setCustomId(s)
        .setStyle('Secondary')
        for(i = 0; i < 25; i++) buttons.push(button(`btn${i}`))
        let bombs = []
        for(let i = 0; i < countBombs; i++) {
            let ind = parseInt(Math.random() * buttons.length)
            while(ind == bombs[0] || ind == bombs[1]) ind = parseInt(Math.random() * buttons.length)
            bombs.push(ind)
        }
        let row = []
        for(i = 5; i < 30; i+= +5) { //criando 5 rows com 5 botões cada
            let a = new Discord.ActionRowBuilder().addComponents(buttons[i-1], buttons[i-2], buttons[i-3], buttons[i-4], buttons[i-5])
            row.push(a)
        }
        let ind = 0
        let newButton = (s) => new Discord.ButtonBuilder()
        .setLabel(' ')
        .setEmoji(s ? '💣' : '💎')
        .setCustomId(`nada${ind}`)
        .setStyle(s ? 'Danger' : 'Success')
        .setDisabled(true)
        let newButton2 = (s) => new Discord.ButtonBuilder()
        .setLabel(' ')
        .setEmoji(s ? '💣' : '💎')
        .setCustomId(`nada${ind}`)
        .setStyle('Secondary')
        .setDisabled(true)
        let emb = new Discord.EmbedBuilder()
        .setColor('Orange')
        .setAuthor({ name: `Mines!`, iconURL: message.author.displayAvatarURL() })
        .setDescription(`**Multiplicador atual**: 1x\n**Próximo multiplicador**: ${proxm}x\n**Bombas**: ${countBombs}\n**Diamantes**: ${diamantes}`)
        function revealButtons() {
            for(o = 0; o < buttons.length; o++) { 
                ind++
                if(!buttons[o].data.custom_id.includes('nada')) buttons[o] = newButton2(bombs.includes(parseInt(buttons[o].data.custom_id.slice(3))) ? true : false)     
            }
        }
        message.channel.send({ embeds:[emb], components: row }).then(msg => {
            let filter = (i) => i.user.id == message.author.id
            let filter2 = (r, u) => r.emoji.name === '✅' && u.id == message.author.id
            let collector = msg.createMessageComponentCollector({ filter, idle: 180000 })
            let collector2  = msg.createReactionCollector({ filter2 })
            collector.on('collect', async (i) => {
                if(bombs.includes(parseInt(i.customId.slice(3)))) {
                    collector.stop()
                    let b = buttons.findIndex(x => x.data.custom_id == i.customId)
                    buttons[b] = newButton(true)
                    emb = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setAuthor({ name: `Mines!`, iconURL: message.author.displayAvatarURL() })
                    .setDescription(`Oh não! Você clicou em uma bomba e perdeu **${valor.toLocaleString('pt')} Poções** (você poderia ter ganhado ${parseInt(valor * multiplicador).toLocaleString('pt')} poções)`)
                    revealButtons()
                    collector.stop('success')
                    collector2.stop('success')
                    i.message.reactions.removeAll().catch(e => {})
                } else {
                    let b = buttons.findIndex(x => x.data.custom_id == i.customId)
                    buttons[b] = newButton(false)
                    let bombs = buttons.filter(a => a.data.style == 3).length
                    diamantes = 22 - bombs
                    ind++
                    multiplicador = cal_mult(bombs).toFixed(4)
                    proxm = cal_mult(bombs + 1).toFixed(4)
                    ativado = true
                    if(diamantes <= 0) {
                        multiplicador = 221.1453
                        emb = new Discord.EmbedBuilder()
                        .setColor("#25C059")
                        .setAuthor({ name: `Mines!`, iconURL: message.author.displayAvatarURL() })
                        .setDescription(`💵 Você ganhou **${(parseInt(valor*multiplicador)).toLocaleString()} Poções** (${multiplicador}x)`)
                        revealButtons()
                        row = []
                        for(p = 5; p < 30; p+= +5) {
                            row.push(new Discord.ActionRowBuilder().addComponents(buttons[p-1], buttons[p-2], buttons[p-3], buttons[p-4], buttons[p-5]))
                        }
                        client.mysql.updateUserMoney(message.author.id, valor*multiplicador)
                        await client.mysql.transactions.create({
                            source: 10,
                            received_by: message.author.id,
                            given_at: Date.now(),
                            amount: valor
                        })
                        msg.reactions.removeAll().catch(e => {})
                        collector.stop('success')
                        collector2.stop('success')
                        return msg.edit({ embeds: [emb], components: row })
                    }
                    emb = new Discord.EmbedBuilder()
                    .setColor('Orange')
                    .setAuthor({ name: `Mines!`, iconURL: message.author.displayAvatarURL() })
                    .setDescription(`**Multiplicador atual**: ${multiplicador}x\n**Próximo multiplicador**: ${proxm}x\n**Bombas**: ${countBombs}\n**Diamantes**: ${diamantes}\n\nClique em ✅ para retirar **${(parseInt(valor*multiplicador)).toLocaleString('pt')} Poções**`)
                    i.message.react('✅')
                }
                row = []
                for(p = 5; p < 30; p+= +5) { 
                    row.push(new Discord.ActionRowBuilder().addComponents(buttons[p-1], buttons[p-2], buttons[p-3], buttons[p-4], buttons[p-5]))
                }
                await i.update({ embeds:[emb], components: row})
            })
            collector.on('end', (c, m) => {
                if(m == 'time') {
                    emb = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`Você não respondeu a tempo e perdeu **${valor.toLocaleString('pt')} Stars**`)
                    revealButtons()
                    msg.reactions.removeAll().catch(e => {})
                    collector2.stop('success')
                }
            })
            collector2.on('collect', async (r, u) => {
                if(u.id != message.author.id) return
                if(!ativado) return
                emb = new Discord.EmbedBuilder()
                .setColor("#25C059")
                .setAuthor({ name: `Mines!`, iconURL: message.author.displayAvatarURL() })
                .setDescription(`💵 Você recebeu **${(parseInt(valor*multiplicador)).toLocaleString('pt')} Poções** (${multiplicador}x)`)
                revealButtons()
                row = []
                for(p = 5; p < 30; p+= +5) {
                    row.push(new Discord.ActionRowBuilder().addComponents(buttons[p-1], buttons[p-2], buttons[p-3], buttons[p-4], buttons[p-5]))
                }
                client.mysql.updateUserMoney(message.author.id, valor*multiplicador)
                await client.mysql.transactions.create({
                    source: 10,
                    received_by: message.author.id,
                    given_at: Date.now(),
                    amount: valor*multiplicador
                })
                msg.reactions.removeAll().catch(e => {})
                collector.stop('success')
                collector2.stop('success')
                msg.edit({ embeds: [emb], components: row })
            })
        })
    }
}