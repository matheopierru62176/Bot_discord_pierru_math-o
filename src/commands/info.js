const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Renvoie des informations sur l\'utilisateur ou le serveur')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Renvoie des informations sur l\'utilisateur')
                .addUserOption(option => 
                    option.setName('target')
                        .setDescription('L\'utilisateur à obtenir des informations')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Renvoie des informations sur le serveur')),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'user') {
            const target = interaction.options.getUser('target') || interaction.user;
            const member = interaction.guild.members.cache.get(target.id);
            const joinDate = member.joinedAt;
            await interaction.reply(`Nom de l'utilisateur: ${target.username}\nDate d'arrivée sur le serveur: ${joinDate}`);
        } else if (interaction.options.getSubcommand() === 'server') {
            await interaction.reply(`Nom du serveur: ${interaction.guild.name}\nNombre de membres: ${interaction.guild.memberCount}`);
        }
    },
};