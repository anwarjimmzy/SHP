const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

function buildCommands() {
  const adminPerm = PermissionFlagsBits.Administrator;

  return [
    new SlashCommandBuilder()
      .setName("server")
      .setDescription("Show public Maple server info")
      .setDefaultMemberPermissions(adminPerm),

    new SlashCommandBuilder()
      .setName("players")
      .setDescription("Show Maple server players (may include IDs)")
      .setDefaultMemberPermissions(adminPerm),

    new SlashCommandBuilder()
      .setName("queue")
      .setDescription("Show Maple server queue")
      .setDefaultMemberPermissions(adminPerm),

    new SlashCommandBuilder()
      .setName("bans")
      .setDescription("Show Maple server bans (may include IDs)")
      .setDefaultMemberPermissions(adminPerm),

    new SlashCommandBuilder()
      .setName("announce")
      .setDescription("Announce a message to the server")
      .setDefaultMemberPermissions(adminPerm)
      .addStringOption((opt) =>
        opt.setName("message").setDescription("Announcement message").setRequired(true).setMaxLength(500),
      ),

    new SlashCommandBuilder()
      .setName("shutdown")
      .setDescription("Shutdown the server (dangerous)")
      .setDefaultMemberPermissions(adminPerm),

    // Settings are handled as separate commands to avoid ambiguous request payloads.
    new SlashCommandBuilder()
      .setName("set-private")
      .setDescription("Set FriendsOnly/Private mode")
      .setDefaultMemberPermissions(adminPerm)
      .addBooleanOption((opt) =>
        opt.setName("private").setDescription("Whether the server is private").setRequired(true),
      ),

    new SlashCommandBuilder()
      .setName("set-hidefromlist")
      .setDescription("Set HideFromList")
      .setDefaultMemberPermissions(adminPerm)
      .addBooleanOption((opt) =>
        opt
          .setName("hidefromlist")
          .setDescription("Whether to hide the server from the list")
          .setRequired(true),
      ),

    new SlashCommandBuilder()
      .setName("set-minlevel")
      .setDescription("Set minimum required level")
      .setDefaultMemberPermissions(adminPerm)
      .addIntegerOption((opt) =>
        opt.setName("minlevel").setDescription("Minimum level").setRequired(true).setMinValue(0).setMaxValue(999999),
      ),

    new SlashCommandBuilder()
      .setName("ban-player")
      .setDescription("Ban or unban a user by ID")
      .setDefaultMemberPermissions(adminPerm)
      .addIntegerOption((opt) =>
        opt.setName("userid").setDescription("User ID").setRequired(true),
      )
      .addBooleanOption((opt) =>
        opt.setName("banned").setDescription("true to ban, false to unban").setRequired(true),
      ),

    new SlashCommandBuilder()
      .setName("kick-player")
      .setDescription("Kick a user by ID")
      .setDefaultMemberPermissions(adminPerm)
      .addIntegerOption((opt) =>
        opt.setName("userid").setDescription("User ID").setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName("reason")
          .setDescription("Optional moderation reason")
          .setRequired(false)
          .setMaxLength(300),
      ),

    new SlashCommandBuilder()
      .setName("set-banner")
      .setDescription("Set the server banner")
      .setDefaultMemberPermissions(adminPerm)
      .addStringOption((opt) =>
        opt.setName("banner").setDescription("Banner text").setRequired(true).setMaxLength(300),
      ),
  ].map((cmd) => cmd);
}

module.exports = { buildCommands };

