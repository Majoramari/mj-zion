import { Awaitable, ClientEvents } from "discord.js";
import { MjClient } from "../client";

export interface EventProps {
	client: MjClient;
}

export type EventKeys = keyof ClientEvents;

export type EventExec<T extends EventKeys> = (
	props: EventProps,
	...args: ClientEvents[T]
) => Awaitable<unknown>;
export interface Event<T extends EventKeys> {
	id: T;
	exec: EventExec<T>;
}
