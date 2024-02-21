const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const JeuDataPath = path.join(__dirname, 'Pokemon_jeu.json');
let JeuData = {};

// Variable pour suivre le bonus de Pokedollars
let pokedollarsBonus = 0;

try {
    // Charger les données de manière synchrone
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

        // Vérifier si les données du joueur existent ou sont vides
        if (!JeuData[userId] || Object.keys(JeuData[userId]).length === 0) {
            // Initialiser les données par défaut si l'utilisateur n'a jamais joué
            JeuData[userId] = { pokedollars: 0, pokeballs: 0, pokemonCaptured: 0 };
        }

        const playerData = JeuData[userId];

        // Gestion de l'interaction sur les boutons
        const filter = i => i.customId.startsWith('pokemon_jeu_');
        const collectorOptions = { filter, time: 60000 };
        const collector = interaction.channel.createMessageComponentCollector(collectorOptions);

        collector.on('collect', async i => {
            const buttonId = i.customId;

            // Traiter chaque bouton individuellement
            if (buttonId === 'pokemon_jeu_earnPokedollars') {
                // Augmenter de (5 + bonus) Pokedollars lorsque le bouton est cliqué
                playerData.pokedollars += (5 + pokedollarsBonus);
            } else if (buttonId === `pokemon_jeu_buyPokeball_${JeuData.pokeballCost}`) {
                // Acheter une Pokeball
                if (playerData.pokedollars >= JeuData.pokeballCost) {
                    // Déduire le coût de la Pokeball
                    playerData.pokedollars -= JeuData.pokeballCost;
                    // Augmenter le nombre de Pokeballs     
                    playerData.pokeballs += 1;

                    // Augmenter le coût des Pokeballs à chaque achat
                    JeuData.pokeballCost = Math.ceil(JeuData.pokeballCost * 1.2);

                    await interaction.followUp(`Vous avez acheté une Pokeball pour ${JeuData.pokeballCost} PokeDollars.`);
                } else {
                    // Informer l'utilisateur qu'il n'a pas assez d'argent pour acheter une Pokeball
                    await interaction.followUp('Vous n\'avez pas assez de PokeDollars pour acheter une Pokeball.');
                }
            } else if (buttonId === 'pokemon_jeu_catchPokemon') {
                // Générer aléatoirement un numéro de Pokémon entre 1 et 898
                const pokemonId = Math.floor(Math.random() * 898) + 1;

                // Récupérer les informations du Pokémon depuis l'API
                const response = await axios.get(`https://pokebuildapi.fr/api/v1/pokemon/${pokemonId}`);
                const pokemonImage = response.data.image;
                const pokemonName = response.data.name;

                // Afficher le Pokémon
                const embed = {
                    color: 0x0099ff,
                    title: 'Attraper un Pokemon',
                    description: `Un Pokémon sauvage apparaît !\n\n**Nom:** ${pokemonName}`,
                    image: { url: pokemonImage },
                };

                // Afficher le bouton pour capturer le Pokémon
                const captureRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`pokemon_jeu_capturePokemon_${pokemonId}`)
                            .setLabel('Capturer')
                            .setStyle(1) // Utilisez la valeur numérique pour PRIMARY (Bleu)
                    );

                await interaction.followUp({ embeds: [embed], components: [captureRow] });
            } else if (buttonId.startsWith('pokemon_jeu_capturePokemon_')) {

                // Extraire l'ID du Pokémon à partir de l'ID du bouton
                const capturedPokemonId = parseInt(buttonId.split('_')[4]);
            
                // Définir le pourcentage de chance de capturer le Pokémon (par exemple, 50%)
                const captureChance = 0.5;
            
                // Générer un nombre aléatoire entre 0 et 1
                const randomValue = Math.random();
            
                if (randomValue <= captureChance) {
                    // Le Pokémon est capturé avec succès
                    playerData.pokeballs -= 1;
                    playerData.pokemonCaptured += 1;

                    // Augmenter le bonus de Pokedollars
                    pokedollarsBonus += 2; // Ajustez selon vos préférences

                    await interaction.followUp(`Vous avez capturé le Pokémon avec succès et gagné un bonus de ${pokedollarsBonus} Pokedollars !`);
                } else {
                    // Le Pokémon s'échappe
                    playerData.pokeballs -= 1;
                    await interaction.followUp(`Le Pokémon s'est échappé !`);
                }
            } 

            // Mettre à jour l'affichage pour montrer le nouveau montant de Pokedollars et le nombre de Pokeballs
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
                        .setEmoji('💰'), // Ajouter une émoji représentant la monnaie
                    new ButtonBuilder()
                        .setCustomId('pokemon_jeu_catchPokemon')
                        .setLabel('Attraper un Pokemon')
                        .setStyle(1)
                );

            await i.update({ embeds: [embed], components: [mainRow] });

            // Enregistrer les données du joueur dans le fichier
            fs.writeFileSync(JeuDataPath, JSON.stringify(JeuData));
        });

        collector.on('end', () => {
            // Enregistrer les données du joueur dans le fichier (au cas où la collecte se termine avant le clic)
            fs.writeFileSync(JeuDataPath, JSON.stringify(JeuData));
        });

        // Afficher l'écran principal du jeu
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
                    .setEmoji('💰'), // Ajouter une émoji représentant la monnaie
                new ButtonBuilder()
                    .setCustomId('pokemon_jeu_catchPokemon')
                    .setLabel('Attraper un Pokemon')
                    .setStyle(1)
            );

        await interaction.reply({ embeds: [embed], components: [mainRow] });
    },
};
