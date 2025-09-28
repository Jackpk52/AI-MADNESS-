import { SlashCommandBuilder } from "discord.js";

let listeningChannels = new Set();

export default {
    data: new SlashCommandBuilder()
        .setName("listen")
        .setDescription("Toggle AI listening in this channel"),
    async execute(interaction) {
        const channelId = interaction.channelId;

        if (listeningChannels.has(channelId)) {
            listeningChannels.delete(channelId);
            await interaction.reply({
                content: `🔇 **Stopped listening** in <#${channelId}>\nI will only respond when mentioned.`,
                ephemeral: false
            });
        } else {
            listeningChannels.add(channelId);
            await interaction.reply({
                content: `🎧 **Now listening** in <#${channelId}>\nI will respond to all messages here!`,
                ephemeral: false
            });
        }
    },
    listeningChannels,
};