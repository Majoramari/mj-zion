import { REST, Routes, APIUser } from "discord.js";
import commands from "../commands";
import { green } from "colorette";
import { configs } from "../utils";

const body = commands.map(({ commands }) => commands.map(({ meta }) => meta)).flat();
const rest = new REST({ version: "10" }).setToken(configs.clientToken);

const main = async () => {
	const currentUser = (await rest.get(Routes.user())) as APIUser;
	const globalEndpoint = Routes.applicationCommands(currentUser.id);
	const localEndpoint = Routes.applicationGuildCommands(currentUser.id, configs.mainGuild);

	const endpoint = process.env.NODE_ENV === "production" ? globalEndpoint : localEndpoint;

	await rest.put(endpoint, { body });

	if (process.env.NODE_ENV === "empty:prod") {
		await rest.put(globalEndpoint, { body: [] });
		return currentUser;
	}
	if (process.env.NODE_ENV === "empty") {
		await rest.put(localEndpoint, { body: [] });
		return currentUser;
	}

	return currentUser;
};

main()
	.then((user) => {
		const tag = `${user.username}#${user.discriminator}`;
		const response =
			process.env.NODE_ENV === "production"
				? green(`Successfully released commands in production as ${tag}!`)
				: process.env.NODE_ENV === "empty"
				? green(`Successfully removed local commands!`)
				: process.env.NODE_ENV === "empty:prod"
				? green(`Successfully removed global commands!`)
				: green(
						`Successfully registered commands for development in ${configs.mainGuild} as ${tag}!`
				  );

		console.log(response);
	})
	.catch(console.error);
