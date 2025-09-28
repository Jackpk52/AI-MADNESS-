import dotenv from "dotenv";
dotenv.config();
import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Load commands using dynamic imports with file:// URLs
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const fileUrl = new URL(`file://${filePath}`).href;
    
    try {
        const commandModule = await import(fileUrl);
        const command = commandModule.default || commandModule;
        if (command.data) {
            commands.push(command.data.toJSON());
        }
    } catch (error) {
        console.error(`❌ Failed to load command ${file}:`, error);
    }
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
