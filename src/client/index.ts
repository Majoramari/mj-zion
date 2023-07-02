import { ChannelType, Client, ClientOptions, Collection, ThreadChannel } from "discord.js";
import { log, logo, LoggerColor, registerEvents, configs, GamesArray, gamesArray } from "../utils";
import { Database } from "../modules";
import events from "../events";
import threadsJson from "../assets/threads.json";

import { GameCategoryJson } from "../types";

export class MjClient extends Client {
	readonly database = new Database(configs.databaseUrl);
	readonly gamesArray: Map<string, GamesArray> = gamesArray();

	constructor(options: ClientOptions) {
		super(options);
		logo();

		registerEvents(this, events);

		this.login(configs.clientToken).catch((err) => {
			log(err, LoggerColor.ERROR);
			process.exit(1);
		});
	}

	async getGamesThreads(): Promise<Collection<string, ThreadChannel>> {
		const guildForum = await this.channels.cache.get(configs.gamesForum);

		if (!guildForum) throw new Error("MJ-404GC - Channel of type forum not found on server");
		if (guildForum?.type !== ChannelType.GuildForum)
			throw new Error("MJ-NAGT - The thread is not of type GuildForum");

		const gamesThreads = guildForum.threads.cache.filter((gameThread) => {
			return threadsJson.map((e) => e.id).includes(gameThread.id);
		});

		if (!gamesThreads.size) throw new Error("MJ-NOGTS - No game threads");

		return gamesThreads;
	}

	getThreadGamesByThreadId(id: string):
		| {
				name: string;
				image: string;
		  }[]
		| undefined {
		const threadConfig: GameCategoryJson = threadsJson.filter((thread) => thread.id === id)[0];
		if (!threadConfig) return;
		return threadConfig.games;
	}
}
