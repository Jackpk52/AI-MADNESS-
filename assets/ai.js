import { OpenAI } from "openai";

// Initialize the OpenAI client with HuggingFace router
const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN,
});

async function generateAIResponse(prompt) {
    const cleanPrompt = prompt.replace(/<@!?\d+>/g, '').trim();
    
    if (!cleanPrompt) {
        return "Hello! How can I help you today?";
    }

    try {
        // Use the HuggingFace router with DeepSeek model
        const chatCompletion = await client.chat.completions.create({
            model: "deepseek-ai/DeepSeek-V3.1-Terminus:novita",
            messages: [
                {
                    role: "user",
                    content: cleanPrompt,
                },
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content;
        
        if (aiResponse) {
            return aiResponse;
        } else {
            return generateFallbackResponse(cleanPrompt);
        }

    } catch (error) {
        console.error("🤖 AI API Error:", error.message);
        
        // Handle specific errors
        if (error.message.includes("quota") || error.message.includes("limit")) {
            return "⚠️ I've reached my API limit for now. Please try again in a little while!";
        } else if (error.message.includes("token") || error.message.includes("auth")) {
            return "🔑 There's an issue with my AI access. Please check the bot configuration.";
        } else {
            return generateFallbackResponse(cleanPrompt);
        }
    }
}

// Smart fallback responses
function generateFallbackResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
        return "👋 Hello! I'm Chaos Bot! How can I help you today?";
    } else if (lowerPrompt.includes('how are you')) {
        return "I'm doing great! Ready to chat with you! How about you?";
    } else if (lowerPrompt.includes('thank')) {
        return "You're welcome! 😊 Happy to help!";
    } else if (lowerPrompt.includes('?')) {
        return "That's a great question! While my AI brain is taking a quick break, I'd love to hear your thoughts on that.";
    } else if (lowerPrompt.includes('bot') || lowerPrompt.includes('chaos')) {
        return "🤖 That's me! Chaos Bot - your friendly AI assistant!";
    }
    
    const responses = [
        "That's interesting! Tell me more about that.",
        "I see what you mean. What are your thoughts on this?",
        "Fascinating! How does that make you feel?",
        "I understand. What would you like to discuss next?",
        "That's a great point! Let's explore this further."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

export { generateAIResponse };