const Discord = require('discord.js')
const { abbreviate, relativeTime } = require('util-stunks')

module.exports = {
    name: 'roleta',
    aliases: [''],
    description: '',
    cooldown: 1000,
    usage: '',
    run: async (client, message, args) => {
    const embed = new Discord.EmbedBuilder()
    .setColor('Orange')
    .setTitle(`Roleta de Prêmios`)
    .addFields([
      { name: `🎁 Presente misterioso`, value: `*Chance de 1%*`, inline: true },
      { name: `VIP 15 dias`, value: `*Chance de 2%*`, inline: true },
      { name: `🧪 350.000.000 poções`, value: `*Chance de 3%*`, inline: true },
      { name: `🧪 250.000.000 poções`, value: `*Chance de 5%*`, inline: true },
      { name: `🧪 100.000.000 poções`, value: `*Chance de 10%*`, inline: true },
      { name: `🧪 60.000.000 poções`, value: `*Chance de 25%*`, inline: true },
      { name: `🧪 30.000.000 poções`, value: `*Chance de 35%*`, inline: true },
      { name: `🧪 15.000.000 poções`, value: `*Chance de 45%*`, inline: true },
      { name: `⭐ 15 Reputações`, value: `*Chance de 50%*`, inline: true },
    ])
    const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
    .setLabel('Girar roleta')
    .setCustomId('jequiti')
    .setStyle('Primary'))
    client.sendReply(message, { embeds: [embed], components: [btn] }).then(msg => {
        let filter = i => i.user.id == message.author.id
        let collector = msg.createMessageComponentCollector({ filter, time: 150000 })
        collector.on('collect', async (i) => {
            const Cooldowns = await client.mysql.getCooldowns(i.user.id, true)
            const AuthorData = await client.mysql.findUser(i.user.id, true)
            let valor = 100000000
            if (Cooldowns.roleta > Date.now()) return i.reply({
                content: `${client.config.emojis.clock} ${i.user}, espere \`${relativeTime(Cooldowns.roleta, { displayAtMax: 2 })}\` para girar a roleta novamente.`,
                ephemeral: true
            })
            if(AuthorData.money < valor) return i.reply({ content: `${client.config.emojis.error} Você não tem poções o suficiente para girar a roleta!`, ephemeral: true })
            await client.mysql.updateUserMoney(i.user.id, -valor)
            await client.mysql.updateCooldowns(i.user.id, 'roleta', Date.now() + 3600000);
            let rand = Math.random() * 100
            let pocoes = 0
            let vip = false
            let rep = false
            let premioo = false
            let premio = ''
            if(rand <= 1) {
                premioo = true
                premio = '**650.000.000 🧪 Poções + VIP 10 Dias**'
            } else if (rand <= 2) { //3
              premio = '**VIP 15 dias**'
              vip = true
            } else if (rand <= 3) { //3
              premio = '**350.000.000 Poções**'
              vip = true
            } else if (rand <= 5) { //6
              premio = '**250.000.000 Poções**'
              pocoes = 250000000
            } else if (rand <= 10) { //10
              premio = '**100.000.000 Poções**'
              pocoes = 100000000
            } else if (rand <= 25) { //15
              premio = '**60.000.000 Poções**'
              pocoes = 60000000
            } else if (rand <= 35) { //20
              premio = '**30.000.000 Poções***'
              pocoes = 30000000 
            } else if (rand <= 45) { //30
              premio = '**15.000.000 Poções**'
              pocoes = 15000000
            } else if (rand <= 50) { //35
              premio = '**15 Reputações**'
              rep = true
            }
            else premio = 'Nada'
            client.mysql.updateCooldowns(i.user.id, 'roleta', Date.now() + require('ms')('1h'));
            if(premioo) {
                await client.mysql.updateUserPremium(i.user.id, '10d');
                await client.mysql.updateUserMoney(i.user.id, 650000000)
            }
            if(pocoes > 0) await client.mysql.updateUserMoney(i.user.id, pocoes)
            if(vip) await client.mysql.updateUserPremium(i.user.id, '15d');
            if(rep) for(let i = 0; i < 15; i++) await client.mysql.updateUserReputation(i.user.id, client.user.id, '');
            i.reply({ content: `${i.user} Giramos a roleta e você ganhou ${premio}!` })
        })
    })
  }
}