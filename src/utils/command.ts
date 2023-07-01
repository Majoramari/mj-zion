import { Command, CommandCategory, CommandCategoryExtra, CommandExec, CommandMeta } from "../types";

export const command = (meta: CommandMeta, exec: CommandExec) => {
	return {
		meta,
		exec,
	};
};

export const category = (
	name: string,
	commands: Command[],
	extra: CommandCategoryExtra = {}
): CommandCategory => ({
	name,
	commands,
	...extra,
});
