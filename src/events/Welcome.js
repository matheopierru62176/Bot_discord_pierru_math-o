// welcome.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
        name: 'guildMemberAdd',
        once: false,
        execute(member) {    // Vérifier si member et member.user existent

        console.log(`Un nouveau membre a rejoint : ${member.user.tag}`);

        const welcomeChannel = member.guild.channels.cache.get('1209147657688186990');

        if (!welcomeChannel) return;

        // Construire un MessageEmbed pour le message de bienvenue
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2ecc71') // Couleur du cadre
            .setTitle(`Bienvenue sur ${member.guild.name} !`)
            .setDescription(`Bienvenue, ${member.user.tag} ! Nous sommes ravis de t'accueillir sur le serveur.`)
            .setThumbnail(member.user.displayAvatarURL()) // Afficher la PP du membre
            .setImage('https://www.ma-plume-webmag.com/images/images-site/decouvertes/170126-sakura-night.jpg'); 
        // Envoyer le MessageEmbed dans le canal de bienvenue
        welcomeChannel.send({ embeds: [welcomeEmbed] });
    }
};