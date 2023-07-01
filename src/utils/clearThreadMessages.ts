import { MessageType } from "discord.js";
import { LoggerColor, log } from ".";
import { MjClient } from "../client";

const TWO_MINUTE = 120000;

export const clearChannel = async (client: MjClient) => {
	setInterval(async () => {
		const threads = await client.getGamesThreads();
		threads.forEach(async (thread) => {
			const messages = await thread.messages.fetch();
			const filteredMessages = messages.filter(
				(message) =>
					message.type !== MessageType.ChannelNameChange && message.author.id !== client.user?.id
			);
			thread.bulkDelete(filteredMessages, true).catch((error) => {
				if (error.message === "Missing Permissions") {
					thread.send({
						content: "## ⚠️ [Messages Manage] permission is required",
					});
				}
				log(error.message, LoggerColor.ERROR, error.stack);
			});
		});
	}, TWO_MINUTE);
};
