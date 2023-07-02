import { GatewayIntentBits } from "discord.js";
import { MjClient } from "./client";

new MjClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
	],
});
