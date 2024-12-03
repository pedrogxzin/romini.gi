const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, User, InteractionCollector } = require('discord.js')
const { unabbreviate } = require('util-stunks')

module.exports = {
    name: 'race',
    aliases: ['race'],
    description: 'Abra uma corrida de Ametistas apostada com limite de até 20 usuários.',
    cooldown: 2200,
    usage: '<valor> [limite]',
    /** @param {import('../../Base/client')} client */
    run: async (client, message, args) => {
        const AuthorData = await client.mysql.findUser(message.author.id, true)
        let Value = Math.floor(unabbreviate(args[0] || 0))

        // const Cooldowns = await client.mysql.getCooldowns(message.author.id, true)

        // if (Cooldowns.daily > Date.now()) {
        //     return client.sendReply(message, {
        //         content: `Você precisa resgatar o daily para poder utilizar esse comando!`,
        //         ephemeral: true
        //     })
        // }

        if (args[0].toLowerCase() == 'half') {
            Value = Math.floor(AuthorData.money / 2)
            if (Value > 100_000_000_000_000_000_000) Value = 100_000_000_000_000_000_000
        }

        if (args[0].toLowerCase() == 'all') {
            Value = Math.floor(AuthorData.money)
            if (Value > 100_000_000_000_000_000_000) Value = 100_000_000_000_000_000
        }

        let Limit = parseInt(args[1]), Users = [await getCar(client, message.author.id)]

        if (!Limit || isNaN(Limit) || Limit > 20) Limit = 20
        if (Limit < 2) Limit = 2

        if ((isNaN(Value) || Value < 0 || Value > 100_000_000_000_000_000)) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, digite um valor número acima de **0 Estrelas** iniciar uma corrida.`
        })

        if (AuthorData.money < Value) return client.sendReply(message, {
            content: `${client.config.emojis.error} ${message.author}, você não tem tantas Nuvens assim para iniciar uma corrida.`
        })

        const Embed = new EmbedBuilder()

            .setColor(`#FF00DB`)
            .setFooter({
                text: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp()

            .setTitle(`# Briga de Carros`)
            .setDescription(`Preço para participar: **${Value.toLocaleString()} Nuvens** 
Para entrar clique em: 🏁!
O ganhador da briga de carros será revelado após ${message.author}, Reagir no ✅ Ou após se passar 60 segundos ou após atingir ${Limit} participantes.`)

            .setFields([
                {
                    name: 'Prêmio:',
                    value: (client.config.emojis.money + ' **' + Value.toLocaleString('pt') + '** Nuvens'),
                    inline: true
                },
                {
                    name: `Participantes 1/${Limit}`,
                    value: Users.map(u => `${u.car} <@${u.id}>`).join('\n'),
                }
            ])

        const Row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('enter')
                    .setLabel('Entrar')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('stop')
                    .setLabel('Finalizar')
                    .setEmoji('🏁')
                    .setStyle(ButtonStyle.Success)
            )

        const Message = await client.sendReply(message, {
            content: message.author.toString(),
            embeds: [Embed],
            components: [Row]
        })
        const Collector = new InteractionCollector(client, { message: Message, time: 1 * 60 * 1000, filter: f => !f.user.bot });

        Collector.on('collect', async (button) => {

            if (button.customId == 'stop' && button.user.id === message.author.id) {
                await button.deferUpdate()
                Message.components[0].components[0].data.disabled = true
                Message.components[0].components[1].data.disabled = true

                await Message.edit({ components: Message.components })
                return Collector.stop()
            }
            if (button.customId == 'enter' && button.user.id !== message.author.id) {
                try {
                    // const Cooldowns = await client.mysql.getCooldowns(button.user.id, true)

                    // if (Cooldowns.daily > Date.now()) {
                    //     return client.sendReply(button, {
                    //         content: `Você precisa resgatar o daily para poder utilizar esse comando!`,
                    //         ephemeral: true
                    //     })
                    // }

                    if (Users.map(x => x.id).includes(button.user.id)) return;
                    let UserEnterData = await client.mysql.findUser(button.user.id, true)
                    if (UserEnterData?.ban_is) return;
                    const emoji = await getCar(client, button.user.id)
                    if (UserEnterData?.money >= Value) Users.push(emoji)
                    else return;
                    // button.reply({ content: `Você entrou na Race de ${(Value * Users.map(x => x.id).length).toLocaleString('pt')} com seu emoji ${emoji} boa sorte!` })
                    let EmbedFields = Message.embeds[0].data

                    EmbedFields.fields[0] = { name: `Prêmio`, value: (client.config.emojis.money + ' **' + (Value * Users.map(x => x.id).length).toLocaleString('pt') + '** Estrelas'), inline: true }
                    EmbedFields.fields[1] = { name: `Participantes (${Users.length}/${Limit})`, value: `${Users.map(u => `${u.car} <@${u.id}>`).join('\n')}`, inline: false }

                    Message?.edit({ embeds: [EmbedFields] })

                    if (Users.length >= Limit) return Collector.stop()
                } catch (e) {
                    console.log(e)
                }
            }
        })

        const UsersTrueArray = []

        Collector.on('end', async () => {
            for (let i of Users) {
                let CheckData = await client.mysql.findUser(i.id, true)
                if (CheckData?.money >= Value) UsersTrueArray.push(i)
            }

            if (UsersTrueArray.length < 2) return message.reply(`${client.config.emojis.error} ${message.author}, não tinham participantes o suficiente nessa corrida, a mesma foi cancelada.`)

            else {
                let Winner = UsersTrueArray[parseInt(Math.random() * UsersTrueArray.length)],
                    TrueValue = parseInt((Value * UsersTrueArray.length) - Value)
                let TaxedValue = await client.mysql.findUserPremium(Winner.id) ? TrueValue : parseInt((TrueValue / 100) * 95)

                for (let i of UsersTrueArray) {
                    client.mysql.updateUserMoney(i.id, i.id == Winner.id ? TaxedValue : -Value)

                    await client.mysql.transactions.create({
                        source: 5,
                        received_by: i.id,
                        given_at: Date.now(),
                        amount: (i.id == Winner.id ? TaxedValue : -Value)
                    })
                }

                let EmbedFields = Message.embeds[0].data

                EmbedFields.fields[0] = { name: `Prêmio`, value: (client.config.emojis.money + ' **' + (TrueValue + Value).toLocaleString('pt') + '** Estrelas'), inline: true }
                EmbedFields.fields[1] = { name: `Ganhador`, value: `<@${Winner.id}> e seu **Emoji:** ${Winner.car}`, inline: true }
                EmbedFields.fields[2] = { name: `Participantes [${Users.length}/${Limit}]`, value: `${Users.map(u => `${u.car} <@${u.id}>`).join('\n')}`, inline: false }

                Message.components[0].components[0].data.disabled = true
                Message.components[0].components[1].data.disabled = true

                Message?.edit({ embeds: [EmbedFields], components: Message.components })
                Message?.reply(` Um guerreiro sobrevivou na briga de carros ${Winner.car} Venceu esta briga, briga iniciada por <@${message.author.id}>! Como Recompensa  <@${Winner.id}> **Recebeu ${TaxedValue.toLocaleString()} Nuven${TaxedValue > 1 ? 's' : ''}** ${parseInt(TrueValue - TaxedValue) == 0 ? '' : `\`(${(TrueValue - TaxedValue).toLocaleString()} de taxa)\``} e ${Users.length >= 3 ? `os ${(Users.length - 1)} perdedores perderam` : 'o perdedor perdeu'} **${Value.toLocaleString()} Nuven${Value > 1 ? 's' : ''}!**`)
            }
        })
    }
}

async function getCar(client, id) {
    const user = await client.mysql.findUser(id, true);

    const cars = ['🚃', '🚕', '🚘', '🚎', '🚚', '🛺', '🚔', '🚜', '🚖', '🚗', '🚙'];
    let car = await user.emoji || cars[Math.floor(Math.random() * cars.length)];
    if (user.premium < Date.now()) car = cars[Math.floor(Math.random() * cars.length)];

    return { id, car };
}