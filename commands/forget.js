const { SlashCommandBuilder } = require("discord.js");
const { clearMemory } = require("../assets/memory.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("forget")
        .setDescription("Clear AI memory in this channel"),
    async execute(interaction) {
        clearMemory(interaction.channelId);
        await interaction.reply({
            content: "🧹 **Memory cleared!**\nI've forgotten our conversation in this channel.",
            ephemeral: false
        });
    },
};