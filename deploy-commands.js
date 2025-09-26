require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Check environment variables
if (!process.env.DISCORD_TOKEN) {
    console.error("❌ Missing DISCORD_TOKEN in .env");
    process.exit(1);
}
if (!process.env.CLIENT_ID) {
    console.error("❌ Missing CLIENT_ID in .env");
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log("🚀 Deploying slash commands...");

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ Successfully deployed ${data.length} commands!`);
        console.log("📋 Commands:", data.map(cmd => cmd.name).join(", "));
    } catch (error) {
        console.error("❌ Error deploying commands:");
        console.error(error);
    }
})();
