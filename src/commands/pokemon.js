const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokemon')
        .setDescription('Renvoie une image d\'un Pokémon aléatoire'),
    async execute(interaction) {
        const pokemonId = Math.floor(Math.random() * 898) + 1;
        const response = await axios.get(`https://pokebuildapi.fr/api/v1/pokemon/${pokemonId}`);
        const pokemonImage = response.data.image;
        const pokemonName = response.data.name;
        await interaction.reply({ content: `Pokemon généré : ${pokemonName}`, files: [pokemonImage] });
    },
};