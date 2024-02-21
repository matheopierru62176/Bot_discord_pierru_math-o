// leveling.js
const { EmbedBuilder } = require('discord.js');

const fs = require('fs');
const path = require('path');

const levelsDataPath = path.join(__dirname, 'levelsData.json');
let levelsData = {};
const cooldowns = new Map();

// Charger ou créer le fichier de données des niveaux
try {
    levelsData = require(levelsDataPath);
} catch (err) {
    console.log('Création d\'un nouveau fichier de données des niveaux.');
    fs.writeFileSync(levelsDataPath, JSON.stringify(levelsData));
}

const xpPerMessage = 10; // Nombre de points d'expérience attribués par message
const baseLevelUpXp = 100; // Nombre de points d'expérience de base nécessaires pour passer au niveau suivant
const xpIncreaseFactor = 1.2; // Facteur d'augmentation de l'expérience nécessaire par niveau
const cooldownTime = 10 * 1000; // Cooldown en millisecondes (ici, 10 secondes)

module.exports = {
    name: 'messageCreate',
    once : false,
    execute(message) {  

                // Vérifier si le message provient d'un bot ou est envoyé dans un canal DM
        if (message.author.bot || !message.guild) return;

        // Obtenir l'ID de l'utilisateur
        const userId = message.author.id;

        // Vérifier si l'utilisateur est en cooldown
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId);
            if (Date.now() < expirationTime) {
                return; // Ignorer le message si l'utilisateur est en cooldown
            }
        }

        // Initialiser les points d'expérience pour l'utilisateur s'il n'est pas dans les données
        if (!levelsData[userId]) {
            levelsData[userId] = {
                xp: 0,
                level: 1,
            };
        }

        // Ajouter des points d'expérience pour chaque message
        levelsData[userId].xp += xpPerMessage;

        // Calculer l'expérience nécessaire pour passer au niveau suivant
        const levelUpXp = Math.floor(baseLevelUpXp * Math.pow(xpIncreaseFactor, levelsData[userId].level - 1));

        // Vérifier si l'utilisateur a gagné un niveau
        if (levelsData[userId].xp >= levelUpXp) {
            levelsData[userId].xp -= levelUpXp;
            levelsData[userId].level += 1;
        
            // Créer un embed pour le message
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Niveau supérieur !')
                .setDescription(`Félicitations, ${message.author.tag} ! \n  Tu es maintenant niveau ${levelsData[userId].level} !`)
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
        
            // Envoyer l'embed
            message.channel.send({ embeds: [embed] });
        
            // Mettre à jour l'expérience nécessaire pour le prochain niveau
            levelsData[userId].nextLevelXp = Math.floor(baseLevelUpXp * Math.pow(xpIncreaseFactor, levelsData[userId].level - 1));
        }

        // Mettre en place le cooldown pour l'utilisateur
        cooldowns.set(userId, Date.now() + cooldownTime);

        // Sauvegarder les données des niveaux dans le fichier
        fs.writeFileSync(levelsDataPath, JSON.stringify(levelsData));
    },
};
