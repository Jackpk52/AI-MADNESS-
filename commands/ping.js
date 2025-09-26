const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Show Discord API latency"),
    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: "Pinging...", 
            fetchReply: true 
        });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        
        await interaction.editReply(
            `🏓 **Pong!**\n` +
            `📨 Message Latency: ${latency}ms\n` +
            `🌐 API Latency: ${apiLatency}ms`
        );
    },
};