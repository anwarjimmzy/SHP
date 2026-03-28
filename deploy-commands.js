require("dotenv").config();
const { REST, Routes } = require("discord.js");
const { buildCommands } = require("./src/commands");

async function main() {
  const {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_GUILD_ID,
  } = process.env;

  if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DISCORD_GUILD_ID) {
    throw new Error("Missing DISCORD_TOKEN, DISCORD_CLIENT_ID, or DISCORD_GUILD_ID in environment.");
  }

  const commands = buildCommands().map((c) => c.toJSON());
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

  console.log(`Deploying ${commands.length} commands to guild ${DISCORD_GUILD_ID}...`);
  const data = await rest.put(
    Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
    { body: commands },
  );

  console.log(`Deployed. Total commands: ${data.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

