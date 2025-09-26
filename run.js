const { spawn } = require("child_process");

console.log("🤖 Starting Chaos Bot...");
console.log("📡 Deploying commands...");

spawn("node", ["deploy-commands.js"], { stdio: "inherit" })
    .on("close", (code) => {
        if (code === 0) {
            console.log("✅ Commands deployed successfully!");
            console.log("🚀 Starting bot...");
            spawn("node", ["index.js"], { stdio: "inherit" });
        } else {
            console.error("❌ Command deployment failed!");
            process.exit(1);
        }
    });