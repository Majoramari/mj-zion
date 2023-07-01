import { white } from "colorette";
import { MjClient } from "../../client";
import { LoggerColor, configs, log } from "..";
import categoriesRow from "../../assets/threads.json";
import { GameCategoryJson } from "../../types";

export const startupCheck = async (client: MjClient) => {
	// ! Check if the bot in the main server
	const mainGuild = client.guilds.cache.get(configs.mainGuild);
	if (!mainGuild) {
		return log("MJ-404MS - The bot is not in the main server!", LoggerColor.ERROR);
	}

	// ! Check if the bot in the main server
	if (client.guilds.cache.size > 1) {
		client.guilds.cache.forEach(async (guild) => {
			if (guild.id !== mainGuild.id) {
				await guild.leave();
				log(`I left ${white(guild.name)} server!`, LoggerColor.WARNING);
			}
		});
		log(`Please use the bot in one server!`, LoggerColor.WARNING);
	}

	// ! Check if the threads settings is set right
	const uniqueValues: Set<string> = new Set();
	const categories: GameCategoryJson[] = categoriesRow;
	for (const category of categories) {
		for (const key in category) {
			const value = category[key as keyof GameCategoryJson];

			if (Array.isArray(value)) {
				for (const item of value) {
					if (!item || uniqueValues.has(item.name)) return;
					uniqueValues.add(item.name);
				}
			} else {
				if (!value || uniqueValues.has(value)) {
					log(
						"MJ - 403J Please check the threads configurations in treads.json",
						LoggerColor.ERROR
					);
					process.exit(1);
				}
				uniqueValues.add(value);
			}
		}
	}

	// ! Check if threads are availables
	await client.getGamesThreads();
};
