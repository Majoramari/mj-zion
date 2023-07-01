import { REST, Routes, APIUser } from "discord.js";
import commands from "../commands";
import { green } from "colorette";
import { configs } from "../utils";

const body = commands.map(({ commands }) => commands.map(({ meta }) => meta)).flat();
const rest = new REST({ version: "10" }).setToken(configs.clientToken);

const main = async () => {
	const currentUser = (await rest.get(Routes.user())) as APIUser;

	const endpoint =
		process.env.NODE_ENV === "production"
			? Routes.applicationCommands(currentUser.id)
			: Routes.applicationGuildCommands(currentUser.id, configs.mainGuild);

	await rest.put(endpoint, { body });

	return currentUser;
};

main()
	.then((user) => {
		const tag = `${user.username}#${user.discriminator}`;
		const response =
			process.env.NODE_ENV === "production"
				? green(`Successfully released commands in production as ${tag}!`)
				: green(
						`Successfully registered commands for development in ${configs.mainGuild} as ${tag}!`
				  );

		console.log(response);
	})
	.catch(console.error);
