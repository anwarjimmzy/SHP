require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { createMapleClient, truncate } = require("./mapleApi");

const {
  DISCORD_TOKEN,
  MAPLE_API_KEY,
  MAPLE_BASE_URL,
} = process.env;

if (!DISCORD_TOKEN) {
  throw new Error("Missing DISCORD_TOKEN in environment.");
}

const maple = createMapleClient({
  apiKey: MAPLE_API_KEY,
  baseUrl: MAPLE_BASE_URL || "https://maple-api.marizma.games",
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

function safeStringify(obj, space = 2) {
  try {
    return JSON.stringify(obj, null, space);
  } catch {
    return String(obj);
  }
}

async function replyJson(interaction, title, payload) {
  const text = typeof payload === "string" ? payload : safeStringify(payload, 2);
  const desc = truncate(text, 3500);
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(desc)
    .setColor(0x2b6dff);
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === "server") {
      const data = await maple.getServerInfo();
      const admins = Array.isArray(data.Admins) ? data.Admins : [];
      const headAdmins = Array.isArray(data.HeadAdmins) ? data.HeadAdmins : [];
      const coOwnersExtra = Array.isArray(data.CoOwners) ? data.CoOwners : [];
      const coOwnerCount = headAdmins.length > 0 ? headAdmins.length : coOwnersExtra.length;

      const embed = new EmbedBuilder()
        .setTitle(data.ServerName || "Server")
        .setColor(0x2b6dff)
        .setDescription(
          [
            data.ServerDescription ? `_${data.ServerDescription}_` : null,
            `Players: ${data.PlayerCount}/${data.MaxPlayers}`,
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .addFields(
          { name: "Owner", value: data.Owner != null ? String(data.Owner) : "—", inline: true },
          { name: "Admins", value: String(admins.length), inline: true },
          { name: "Co-owners", value: String(coOwnerCount), inline: true },
        );

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (commandName === "players") {
      const data = await maple.getServerPlayers();
      await replyJson(interaction, "Server Players", data?.Players ?? data);
      return;
    }

    if (commandName === "queue") {
      const data = await maple.getServerQueue();
      await replyJson(interaction, "Server Queue", data?.Queue ?? data);
      return;
    }

    if (commandName === "bans") {
      const data = await maple.getServerBans();
      await replyJson(interaction, "Server Bans", data?.Bans ?? data);
      return;
    }

    if (commandName === "announce") {
      const message = interaction.options.getString("message", true);
      await maple.announce(message);
      await interaction.reply({ content: "Announcement sent.", ephemeral: true });
      return;
    }

    if (commandName === "shutdown") {
      await interaction.reply({ content: "Shutting down the server... (this may take a moment)", ephemeral: true });
      await maple.shutdown();
      return;
    }

    if (commandName === "set-private") {
      const isPrivate = interaction.options.getBoolean("private", true);
      await maple.setSetting({ Private: isPrivate });
      await interaction.reply({ content: `Set Private=${isPrivate}`, ephemeral: true });
      return;
    }

    if (commandName === "set-hidefromlist") {
      const hideFromList = interaction.options.getBoolean("hidefromlist", true);
      await maple.setSetting({ HideFromList: hideFromList });
      await interaction.reply({ content: `Set HideFromList=${hideFromList}`, ephemeral: true });
      return;
    }

    if (commandName === "set-minlevel") {
      const minLevel = interaction.options.getInteger("minlevel", true);
      await maple.setSetting({ minLevel });
      await interaction.reply({ content: `Set minLevel=${minLevel}`, ephemeral: true });
      return;
    }

    if (commandName === "ban-player") {
      const userId = interaction.options.getInteger("userid", true);
      const banned = interaction.options.getBoolean("banned", true);
      await maple.banPlayer({ userId, banned });
      await interaction.reply({ content: `${banned ? "Banned" : "Unbanned"} userId=${userId}`, ephemeral: true });
      return;
    }

    if (commandName === "kick-player") {
      const userId = interaction.options.getInteger("userid", true);
      const reason = interaction.options.getString("reason", false) || undefined;
      await maple.kick({ userId, moderationReason: reason });
      await interaction.reply({ content: `Kicked userId=${userId}`, ephemeral: true });
      return;
    }

    if (commandName === "set-banner") {
      const banner = interaction.options.getString("banner", true);
      await maple.setBanner(banner);
      await interaction.reply({ content: "Banner updated.", ephemeral: true });
      return;
    }

    await interaction.reply({ content: "Unknown command.", ephemeral: true });
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    await interaction.reply({ content: `Error: ${truncate(msg, 1800)}`, ephemeral: true }).catch(() => {});
  }
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(DISCORD_TOKEN);

