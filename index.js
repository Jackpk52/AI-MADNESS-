import dotenv from "dotenv";
dotenv.config();
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { generateAIResponse } from "./assets/ai.js";
import { addToMemory, getMemory } from "./assets/memory.js";
import listen from "./commands/listen.js";

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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.commands = new Collection();

// Load commands using dynamic imports with file:// URLs
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const fileUrl = new URL(`file://${filePath}`).href;
    
    try {
        const commandModule = await import(fileUrl);
        const command = commandModule.default || commandModule;
        if (command.data) {
            client.commands.set(command.data.name, command);
        }
    } catch (error) {
        console.error(`❌ Failed to load command ${file}:`, error);
    }
}

// FIXED: Use 'ready' event instead of 'clientReady'
client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
});

// Handle slash commands
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ 
            content: "⚠️ There was an error executing this command.", 
            ephemeral: true 
        });
    }
});

// Enhanced message handler with memory and listening mode
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    
    // Check if bot is mentioned OR channel is in listening mode
    const isMentioned = message.mentions.has(client.user);
    const isListening = listen.listeningChannels.has(message.channelId);
    
    if (!isMentioned && !isListening) return;

    const input = message.content.replace(`<@${client.user.id}>`, "").trim();
    
    // If not mentioned and no input, ignore (for listening mode)
    if (!isMentioned && !input) return;

    try {
        // Get conversation history
        const memory = getMemory(message.channelId);
        
        // Create context from memory
        let context = "";
        if (memory.length > 0) {
            context = memory.map(msg => `${msg.role}: ${msg.text}`).join('\n') + '\n';
        }
        
        const fullPrompt = `${context}user: ${input}`;
        
        // Show typing indicator
        await message.channel.sendTyping();
        
        const reply = await generateAIResponse(fullPrompt);
        
        // Add to memory
        addToMemory(message.channelId, "user", input);
        addToMemory(message.channelId, "assistant", reply);
        
        await message.reply(reply);
    } catch (err) {
        console.error("AI Error:", err);
        await message.reply("⚠️ AI failed to respond. Please try again.");
    }
});

client.login(process.env.DISCORD_TOKEN);
