const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const JeuDataPath = path.join(__dirname, 'Pokemon_jeu.json');
let JeuData = {};

let pokedollarsBonus = 0;

try {
    const rawData = fs.readFileSync(JeuDataPath);
    JeuData = JSON.parse(rawData);
} catch (err) {
    console.log('Création d\'un nouveau fichier de données des niveaux.');
    JeuData = {
        pokeballCost: 10,
        capturedPokemonList: {},
    };
    fs.writeFileSync(JeuDataPath, JSON.stringify(JeuData));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokemon_jeu')
        .setDescription('Jouer au jeu Pokemon'),

    async execute(interaction) {
        const userId = interaction.user.id;

        if (!JeuData[userId] || Object.keys(JeuData[userId]).length === 0) {
            JeuData[userId] = { pokedollars: 0, pokeballs: 0, pokemonCaptured: 0 };
        }

        const playerData = JeuData[userId];


        const filter = i => i.customId.startsWith('pokemon_jeu_');
        const collectorOptions = { filter, time: 60000 };
        const collector = interaction.channel.createMessageComponentCollector(collectorOptions);

        collector.on('collect', async i => {
            const buttonId = i.customId;
            if (buttonId === 'pokemon_jeu_earnPokedollars') {
                playerData.pokedollars += (5 + pokedollarsBonus);

            } else if (buttonId === `pokemon_jeu_buyPokeball_${JeuData.pokeballCost}`) {
                if (playerData.pokedollars >= JeuData.pokeballCost) {
                    playerData.pokedollars -= JeuData.pokeballCost;
                    playerData.pokeballs += 1;

                    JeuData.pokeballCost = Math.ceil(JeuData.pokeballCost * 1.2);

                    await interaction.followUp(`Vous avez acheté une Pokeball pour ${JeuData.pokeballCost} PokeDollars.`);
                } else {
                    await interaction.followUp('Vous n\'avez pas assez de PokeDollars pour acheter une Pokeball.');
                }
            } else if (buttonId === 'pokemon_jeu_catchPokemon') {
                const pokemonId = Math.floor(Math.random() * 898) + 1;

                const response = await axios.get(`https://pokebuildapi.fr/api/v1/pokemon/${pokemonId}`);
                const pokemonImage = response.data.image;
                const pokemonName = response.data.name;

                const embed = {
                    color: 0x0099ff,
                    title: 'Attraper un Pokemon',
                    description: `Un Pokémon sauvage apparaît !\n\n**Nom:** ${pokemonName}`,
                    image: { url: pokemonImage },
                };

                const captureRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`pokemon_jeu_capturePokemon_${pokemonId}`)
                            .setLabel('Capturer')
                            .setStyle(1)
                    );

                await interaction.followUp({ embeds: [embed], components: [captureRow] });
            } else if (buttonId.startsWith('pokemon_jeu_capturePokemon_')) {

            
                const captureChance = 0.5;
            
                const randomValue = Math.random();
            
                if (randomValue <= captureChance) {
                    playerData.pokeballs -= 1;
                    playerData.pokemonCaptured += 1;

                    pokedollarsBonus += 3; 

                    await interaction.followUp(`Vous avez capturé le Pokémon avec succès et gagné un bonus de ${pokedollarsBonus} Pokedollars !`);
                } else {
                    playerData.pokeballs -= 1;
                    await interaction.followUp(`Le Pokémon s'est échappé !`);
                }
            } 

            const embed = {
                color: 0x0099ff,
                title: 'Jeu Pokemon',
                fields: [
                    { name: 'PokeDollars', value: `\u200B${playerData.pokedollars}`, inline: true },
                    { name: 'Pokeballs', value: `\u200B${playerData.pokeballs}`, inline: true },
                    { name: 'Pokemons capturés', value: `\u200B${playerData.pokemonCaptured}`, inline: true },
                ],
            };

            const mainRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('pokemon_jeu_earnPokedollars')
                        .setLabel('Gagner des PokeDollars')
                        .setStyle(3),
                    new ButtonBuilder()
                        .setCustomId(`pokemon_jeu_buyPokeball_${JeuData.pokeballCost}`)
                        .setLabel(`Acheter une Pokeball (${JeuData.pokeballCost} PokeDollars)`)
                        .setStyle(4)
                        .setEmoji('💰'), 
                    new ButtonBuilder()
                        .setCustomId('pokemon_jeu_catchPokemon')
                        .setLabel('Attraper un Pokemon')
                        .setStyle(1)
                );

            await i.update({ embeds: [embed], components: [mainRow] });

            fs.writeFileSync(JeuDataPath, JSON.stringify(JeuData));
        });

        collector.on('end', () => {
            fs.writeFileSync(JeuDataPath, JSON.stringify(JeuData));
        });

        const embed = {
            color: 0x0099ff,
            title: 'Jeu Pokemon',
            fields: [
                { name: 'PokeDollars', value: `\u200B${playerData.pokedollars}`, inline: true },
                { name: 'Pokeballs', value: `\u200B${playerData.pokeballs}`, inline: true },
                { name: 'Pokemons capturés', value: `\u200B${playerData.pokemonCaptured}`, inline: true },
            ],
        };

        const mainRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('pokemon_jeu_earnPokedollars')
                    .setLabel('Gagner des PokeDollars')
                    .setStyle(3),
                new ButtonBuilder()
                    .setCustomId(`pokemon_jeu_buyPokeball_${JeuData.pokeballCost}`)
                    .setLabel(`Acheter une Pokeball (${JeuData.pokeballCost} PokeDollars)`)
                    .setStyle(4)
                    .setEmoji('💰'),
                new ButtonBuilder()
                    .setCustomId('pokemon_jeu_catchPokemon')
                    .setLabel('Attraper un Pokemon')
                    .setStyle(1)
            );

        await interaction.reply({ embeds: [embed], components: [mainRow] });
    },
};
