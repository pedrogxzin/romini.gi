const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } = require('discord.js')
const { unabbreviate } = require('util-stunks')
class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    get value() {
        if (['J', 'Q', 'K'].includes(this.rank)) {
            return 10;
        } else if (this.rank === 'A') {
            return 11;
        } else {
            return parseInt(this.rank);
        }
    }

    toString() {
        return `${this.rank}${this.suit}`;
    }
}

class Deck {
    constructor() {
        this.suits = ['♥️', '♦️', '♣️', '♠️'];
        this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.cards = [];

        this.initializeDeck();
    }

    initializeDeck() {
        for (const suit of this.suits) {
            for (const rank of this.ranks) {
                this.cards.push(new Card(suit, rank));
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
}

function startBlackjackGame() {
    const deck = new Deck();
    deck.shuffle();

    return {
        deck,
        playerHand: [deck.cards.pop(), deck.cards.pop()],
        dealerHand: [deck.cards.pop(), deck.cards.pop()],
    };
}

function calculateHandValue(hand) {
    let value = hand.reduce((acc, card) => acc + card.value, 0);

    let numAces = hand.filter((card) => card.rank === 'A').length;
    while (value > 21 && numAces > 0) {
        value -= 10;
        numAces -= 1;
    }

    return value;
}

function formatHand(hand) {
    return hand.map((card) => card.toString()).join('**➜**');
}

module.exports = {
    name: 'blackjack',
    aliases: ['bj'],
    description: 'Aposte no blackjack!',
    cooldown: 1900,
    usage: '<valor>',
    run: async (client, message, args) => {

            const amount = Math.floor(unabbreviate(args[0]))

            if(!amount || isNaN(amount)) return await message.reply({ content: `Digite um valor válido!`})
            if(await userHasMoney(message.author.id, amount) === false) return;
            if(amount > 2_500_000) return await message.reply({ content: `O limite de aposta do blackjack é de 2.5M`})
            const game = startBlackjackGame();
            const playerHandValue = calculateHandValue(game.playerHand);
            const dealerHandValue = calculateHandValue(game.dealerHand);

            const embed = new EmbedBuilder()
            .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL()})
            .setTitle("Mesa em jogo.")
            .setDescription("**Como jogar?** Utilize o botão ``Puxar outra`` caso queira outra carta, e em ``Ficar``, caso queira manter. Lembre-se que esse jogo está valendo " + amount*2)
            .setFields([
                {
                    name: "Sua mão:",
                    value: `${formatHand(game.playerHand)} (Total: ${playerHandValue})`,
                    inline: true
                },
                {
                    name: "Mão do Dealer:",
                    value: `${formatHand([game.dealerHand[0]])}`,
                    inline: true
                }
            ])
            const bot_msg = await message.reply({
                embeds: [embed],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                        .setCustomId('hit')
                        .setLabel("Puxar outra")
                        .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                        .setCustomId("stand")
                        .setLabel("Ficar")
                        .setStyle(ButtonStyle.Secondary)
                    )
                ]
            })
            
            const collector = new InteractionCollector(client, {
                filter: f => f.user.id === message.author.id,
                time: 300_000
            })
            await client.mysql.updateUserMoney(message.author.id, -amount)
            collector.on("collect", async interaction => {
                
                if (interaction.customId === 'hit') {
                    await interaction.deferUpdate()
                    game.playerHand.push(game.deck.cards.pop());
    
                    const updatedPlayerHandValue = calculateHandValue(game.playerHand);
                    if (updatedPlayerHandValue > 21) {
                        const [button1, button2] = [interaction.message.components[0].components[0], interaction.message.components[0].components[1]]
                        await interaction.message.edit({
                            embeds: [embed.setFields([
                                {
                                    name: "Sua mão:",
                                    value: `${formatHand(game.playerHand)} (Total: ${updatedPlayerHandValue})`,
                                    inline: true
                                },
                                {
                                    name: "Mão do Dealer:",
                                    value: `${formatHand([game.dealerHand])} (Total: ${calculateHandValue(game.dealerHand)})`,
                                    inline: true
                                }
                            ]).setDescription("Você perdeu!, ultrapassou os 21. E perdeu " + amount + " Ametistas!")]
                        });
                        await interaction.reply({ content: `<@${interaction.user.id}> Você perdeu pois ultrapassou os 21!`})
                        await collector.stop(["Perdeu"]);
                        delete game;
                    } else {
                        await interaction.message.edit({
                            embeds: [embed.setFields([
                                {
                                    name: "Sua mão:",
                                    value: `${formatHand(game.playerHand)} (Total: ${updatedPlayerHandValue})`,
                                    inline: true
                                },
                                {
                                    name: "Mão do Dealer:",
                                    value: `${formatHand([game.dealerHand])} (Total: ${calculateHandValue(game.dealerHand)})`,
                                    inline: true
                                }
                            ]).setDescription("**Como jogar?** Utilize o botão ``Puxar outra`` caso queira outra carta, e em ``Ficar``, caso queira manter.")],
                            components: [interaction.message.components[0]],
                        });
                    }
                } else if(interaction.customId === "stand"){
                    
                    const playerHand = calculateHandValue(game.playerHand)
                    const dealerHand = calculateHandValue(game.dealerHand)
                    if(dealerHand < 16) game.dealerHand.push(game.deck.cards.pop())
                    if(dealerHand < playerHand && playerHand <= 21) game.dealerHand.push(game.deck.cards.pop())

                    const [button1, button2] = [interaction.message.components[0].components[0], interaction.message.components[0].components[1]]
                    button1.data.disabled = true;
                    button2.data.disabled = true;
                    const win = playerHand > dealerHand && playerHand <= 21 ? "Ganhou" : (playerHand < 21 && dealerHand > 21 ? "Ganhou" : (playerHand === dealerHand ? "Empatou" : (playerHand > 21 && dealerHand > 21 ? "Empatou" : "Perdeu")))
                    await interaction.message.edit({
                        embeds: [embed.setFields([
                            {
                                name: "Sua mão:",
                                value: `${formatHand(game.playerHand)} (Total: ${playerHand})`,
                                inline: true
                            },
                            {
                                name: "Mão do Dealer:",
                                value: `${formatHand([game.dealerHand])} (Total: ${calculateHandValue(game.dealerHand)})`,
                                inline: true
                            }
                        ]).setDescription(`Você ${win}!`)],
                        components: [new ActionRowBuilder().addComponents(button1, button2)],
                    });
                    await interaction.reply({ content: `<@${interaction.user.id}> Você ${win}! ${win === "Ganhou" ? `E lucrou ${amount*2} ametistas!` : ""}`})
                    await collector.stop([win])

                }
            })

            collector.on("end", async(undefined, reason) => {
                if (reason === "Ganhou"){
                    await client.mysql.updateUserMoney(message.author.id, amount*2)
                } else if(reason === "time"){
                    await message.channel.send({ content: `<@${message.author.id}> Tempo esgotado!`})
                } else if(reason === "Empatou"){
                    await client.mysql.updateUserMoney(message.author.id, amount)
                }
                
                delete game;
            })
            async function userHasMoney(UserId, valueToCompare) {
                const AuthorData = await client.mysql.findUser(UserId, true)
            
                if (AuthorData.money < valueToCompare) {
                    client.sendReply(message, {
                        content: `${client.config.emojis.error} ${message.author}, como patrocinador, você não possui essa quantidade de Estrelas.`
                    })
                    return false;
                }
                return true;
            }
    }
}

