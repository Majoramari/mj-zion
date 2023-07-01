import { ActivityType } from "discord.js";
import { Event, EventExec, EventKeys } from "../types";
import { LoggerColor, log } from "./logger";
import { MjClient } from "../client";

export const event = <T extends EventKeys>(id: T, exec: EventExec<T>): Event<T> => ({
	id,
	exec,
});

export const registerEvents = (client: MjClient, events: Event<any>[]): void => {
	for (const event of events) {
		client.on(event.id, async (...args) => {
			const props = {
				client,
			};

			try {
				await event.exec(props, ...args);
			} catch (error) {
				client.user?.setPresence({
					activities: [{ name: "Errors", type: ActivityType.Watching }],
					status: "dnd",
					afk: true,
				});
				log(`${error}`, LoggerColor.ERROR, { error });
			}
		});
		log(`${event.id}`, LoggerColor.EVENT);
	}
};
