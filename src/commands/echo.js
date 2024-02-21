const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Renvoie l\'input de l\'utilisateur')
        .addStringOption(option => 
            option.setName('input')
                .setDescription('Input à renvoyer')
                .setRequired(true)),
    async execute(interaction) {
        const input = interaction.options.getString('input');
        await interaction.reply(input);
    },
};