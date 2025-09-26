require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
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

// Import required modules
const { generateAIResponse } = require("./assets/ai");
const { addToMemory, getMemory } = require("./assets/memory");
const listen = require("./commands/listen");

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