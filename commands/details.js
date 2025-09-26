const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("details")
        .setDescription("Show basic Chaos Bot details"),
    async execute(interaction) {
        await interaction.reply(
            "🤖 **Chaos Bot**\n\n" +
            "**Commands:**\n" +
            "`/ping` - Check bot latency\n" +
            "`/details` - Show this info\n" +
            "`/listen` - Toggle AI listening in channel\n" +
            "`/forget` - Clear AI memory\n\n" +
            "**Features:**\n" +
            "• HuggingFace AI (DialoGPT)\n" +
            "• Conversation memory (last 10 messages)\n" +
            "• Channel listening mode\n" +
            "• Slash command support\n\n" +
            "**Usage:**\n" +
            "Mention me or use `/listen` to activate AI!"
        );
    },
};