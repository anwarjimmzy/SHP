# Maple Control Discord Bot

This bot uses your Maple API endpoints and exposes them as Discord slash commands.

## Setup

1. Create a Discord application and bot user in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Set the environment variables (copy from `.env.example` to `.env`):
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_GUILD_ID`
   - `MAPLE_API_KEY`
   - `MAPLE_BASE_URL` (optional)

3. Install dependencies:
   - `npm install`

4. Deploy slash commands to your server:
   - `npm run deploy`

5. Start the bot:
   - `npm start`

## Commands

Read-only:
- `/server`
- `/players`
- `/queue`
- `/bans`

Admin actions (requires `Administrator` permission):
- `/announce` (message)
- `/shutdown`
- `/set-private` (private)
- `/set-hidefromlist` (hidefromlist)
- `/set-minlevel` (minlevel)
- `/ban-player` (userid, banned)
- `/kick-player` (userid, reason?)
- `/set-banner` (banner)

## Notes

- Keep `MAPLE_API_KEY` and `DISCORD_TOKEN` private (do not commit your `.env`).
- The bot retries on Maple `429` (rate limiting) and transient `5xx` errors.

# SHP
# SHP
