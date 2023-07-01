import { Awaitable, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MjClient } from "../client";

export interface CommandProps {
	client: MjClient;
	interaction: ChatInputCommandInteraction;
}

export type CommandExec = (props: CommandProps) => Awaitable<unknown>;
export type CommandMeta =
	| SlashCommandBuilder
	| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export interface Command {
	meta: CommandMeta;
	exec: CommandExec;
}

export interface CommandCategoryExtra {
	description?: string;
	emoji?: string;
}

export interface CommandCategory extends CommandCategoryExtra {
	name: string;
	commands: Command[];
}
