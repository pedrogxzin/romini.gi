const { relativeTime } = require('util-stunks');
const Discord = require('discord.js')
module.exports = {
    name: "divorce",
    aliases: ["divorciar"],
    description: 'Se divorcie do seu casamento',
    cooldown: 1200,
    usage: null,
    run: async (client, message, args) => {
    let data = await client.mysql.findUser(message.author.id, true)
    if (!data.marrieduser) {
      client.sendReply(message, `${client.config.emojis.error} ${message.author} Você não está casado!`)
      return
    }
    let user = data.marrieduser
    user = await client.users.fetch(user)
    let botoes = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
      .setCustomId('sim')
      .setStyle(Discord.ButtonStyle.Danger)
      .setLabel('Sim'),
      new Discord.ButtonBuilder()
      .setCustomId('nao')
      .setStyle(Discord.ButtonStyle.Success)
      .setLabel('Não'))
    let msg = await message.channel.send({
      content: `💔 ${message.author}, tem certeza que deseja se divorciar-se de **${user.username}** ?`,
      components: [botoes]
    })
    const filter = i => i.user.id == message.author.id
    const collector = msg.createMessageComponentCollector({
      filter,
      time: 60000
    })
    collector.on('collect', async (i) => {
      if (i.user.id != message.author.id) return
      i.update({
        components: []
      })
      if (i.customId == 'sim') {
        let data = await client.mysql.findUser(message.author.id, true)
        if (!data.marrieduser) {
          collector.stop('erro')
          return message.channel.send(`❌ ${message.author} Você não está casado!`)
        }
        client.sendReply(message, `😢 ${message.author} Você se divorciou de **${user.username}**.`)
        collector.stop('sim')
      } else if (i.customId == 'nao') {
        client.sendReply(message, `♥️ ${message.author} O amor ainda está no ar!`)
        collector.stop('nao')
      }
    })
    collector.on('end', async (collected, motivo) => {
      if (motivo == 'sim') {
        await client.mysql.updateUser(message.author.id, { marrieduser: null, marriedtime: null })
        await client.mysql.updateUser(user.id, { marrieduser: null, marriedtime: null })
      }
    })
  }
}