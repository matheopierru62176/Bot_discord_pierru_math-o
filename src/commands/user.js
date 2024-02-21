const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Renvoie le nom de l\'utilisateur et sa date d\'arrivée sur le serveur'),
    async execute(interaction) {
        const user = interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        const joinDate = member.joinedAt;
        await interaction.reply(`Nom de l'utilisateur: ${user.username}\nDate d'arrivée sur le serveur: ${joinDate}`);
    },
};