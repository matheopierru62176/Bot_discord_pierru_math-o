const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageDelete,
    once: false,
    execute(message) {
        
        const logChannelId = '1209125295312076860';

        if (message.guild && message.guild.channels.cache.has(logChannelId)) {
            const logChannel = message.guild.channels.cache.get(logChannelId);

            logChannel.send(`# Message supprimé  : \`${message.content}\`\nSupprimé par : ${message.author.tag}`);
        }
    },
};
