// goodbye.js

const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    execute(member) {
        console.log(`Un membre a quitté : ${member.user.tag}`);
        // Récupérer le canal d'au revoir (remplacez 'ID_DU_CANAL' par l'ID réel de votre canal)
        const goodbyeChannel = member.guild.channels.cache.get('1209147657688186990');

        if (!goodbyeChannel) return;

        // Construire un MessageEmbed pour le message d'au revoir
        const goodbyeEmbed = new EmbedBuilder()
            .setColor('#e74c3c') // Couleur du cadre
            .setTitle(`Au revoir, ${member.user.tag} !`)
            .setDescription(`Nous sommes tristes de te voir partir. À bientôt !`)
            .setThumbnail(member.user.displayAvatarURL()) // Afficher la PP du membre
            .setImage('https://www.ma-plume-webmag.com/images/images-site/decouvertes/170126-sakura-night.jpg'); // Ajouter une image


        // Envoyer le MessageEmbed dans le canal d'au revoir
        goodbyeChannel.send({ embeds: [goodbyeEmbed] });
    },
};
