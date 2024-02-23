
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

        if (message.author.bot || !message.guild) return;

        const userId = message.author.id;

        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId);
            if (Date.now() < expirationTime) {
                return; 
            }
        }

        if (!levelsData[userId]) {
            levelsData[userId] = {
                xp: 0,
                level: 1,
            };
        }

        levelsData[userId].xp += xpPerMessage;

        const levelUpXp = Math.floor(baseLevelUpXp * Math.pow(xpIncreaseFactor, levelsData[userId].level - 1));

        if (levelsData[userId].xp >= levelUpXp) {
            levelsData[userId].xp -= levelUpXp;
            levelsData[userId].level += 1;
        
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Niveau supérieur !')
                .setDescription(`Félicitations, ${message.author.tag} ! \n  Tu es maintenant niveau ${levelsData[userId].level} !`)
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
        
            message.channel.send({ embeds: [embed] });
        
            levelsData[userId].nextLevelXp = Math.floor(baseLevelUpXp * Math.pow(xpIncreaseFactor, levelsData[userId].level - 1));
        }

        cooldowns.set(userId, Date.now() + cooldownTime);

        fs.writeFileSync(levelsDataPath, JSON.stringify(levelsData));
    },
};
