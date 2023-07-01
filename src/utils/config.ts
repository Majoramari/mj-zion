import { Config } from "../types";

export const configs: Config = {
	clientToken: process.env.BOT_TOKEN ?? "nil",
	databaseUrl: process.env.DATABASE_URL ?? "nil",
	mainGuild: process.env.MAIN_GUILD ?? "nil",
	gamesForum: process.env.GAMES_FORUM ?? "nil",
	logChannel: process.env.LOG_CHANNEL ?? "nil",
};

if (Object.values(configs).includes("nil"))
	throw new Error("Please set the ENVIRONMENT VARIABLES!");
