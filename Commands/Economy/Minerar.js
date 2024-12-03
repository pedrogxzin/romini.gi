const Discord = require('discord.js')
const ms = require("ms");
const { abbreviate, relativeTime } = require('util-stunks')

module.exports = {
    name: "minerar",
    aliases: [""],
    description: 'Minere para conseguir moedas.',
    cooldown: 2000,
    usage: null,
    run: async (client, message, args) => {
        const Data = await client.mysql.findUser(message.author.id, true)
        const Cooldowns = await client.mysql.getCooldowns(message.author.id, true)
        if(!Data.picareta) return client.sendReply(message, { content: `${client.config.emojis.error} Você não possui uma picareta para minerar!` })
        if (Cooldowns.minerar > Date.now()) return client.sendReply(message, {
            content: `${client.config.emojis.clock} ${message.author}, espere \`${relativeTime(Cooldowns.minerar, { displayAtMax: 2 })}\` para poder utilizar esse comando novamente.`
        })

        function getRandom(array) {
            const auxArray = Array.from(array)
            auxArray.reduce((acc, curr, i, a) => a[i] = acc + curr.chance, 0)
          
            return array[auxArray.findIndex(w => w > Math.random()*auxArray[auxArray.length-1])]
        }
        let minerio = getRandom([
          { rarity: 'Ferro', chance: 30, valor: 10000000 },
          { rarity: 'Ouro', chance: 27, valor: 25000000 },
          { rarity: 'Diamante', chance: 17, valor: 40000000 },
          { rarity: 'Diamante vermelho', chance: 10, valor: 60000000 },
          { rarity: 'Rubi', chance: 7, valor: 90000000 },
          { rarity: 'Esmeralda', chance: 5, valor: 120000000 },
          { rarity: 'Musgravita', chance: 3, valor: 200000000 },
          { rarity: 'kyawthuita', chance: 1, valor: 300000000 }
        ])
        await client.mysql.updateUserMoney(message.author.id, minerio.valor)
        await client.mysql.updateCooldowns(message.author.id, 'minerar', Date.now() + ms('2h'));
        await client.mysql.updateUser(message.author.id, { picaretadas: Data.picaretadas + 1 })
        let embed = new Discord.EmbedBuilder()
        .setTitle('⛏️ Mineração')
        .setColor("Orange")
        .setDescription(`Com a sua **${Data.picareta}**, você conseguiu minerar um **${minerio.rarity}**! E com ele você lucrou **${(minerio.valor).toLocaleString()} Poções**! Retorne em **2 horas** para minerar novamente.\n**Picaretadas restantes**: ${3 - ((Data.picaretadas || 0) + 1)}`)
        if(Data.picaretadas + 1 >= 3) {
            await client.mysql.updateUser(message.author.id, { picareta: null, picaretadas: 0 })
            message.reply({ content: `⚠ ${message.author} Sua picareta quebrou!` })
        }
        message.reply({ embeds: [embed] })
    }
}