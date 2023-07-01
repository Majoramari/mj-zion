import { Colors, EmbedBuilder } from "discord.js";
import commands from "../../commands";
import { Command } from "../../types";
import { LoggerColor, event, log } from "../../utils";

const allCommands = commands.map(({ commands }) => commands).flat();
const allCommandsMap = new Map<string, Command>(allCommands.map((cmd) => [cmd.meta.name, cmd]));

export default event("interactionCreate", async ({ client }, interaction) => {
	if (!interaction.isChatInputCommand()) return;
	if (!(await client.getGamesThreads()).has(interaction.channelId)) {
		const threads = await client.getGamesThreads();

		const supportedChannels = threads.map((thread) => `<#${thread.id}>`).join("\n");

		const embed = new EmbedBuilder({
			color: Colors.Gold,
			description: `**من فضلك استعمل الاوامر في احد القنوات التالية:**\n${supportedChannels}`,
		});
		return interaction.reply({ ephemeral: true, embeds: [embed] });
	}

	try {
		const commandName = interaction.commandName;
		const command = allCommandsMap.get(commandName);

		if (!command) throw new Error("MJ-404ICCMD: Command not found...");

		await command.exec({
			client,
			interaction,
		});

		log(commandName, LoggerColor.COMMAND, { username: interaction.user.tag });
	} catch (error) {
		log(`${error}`, LoggerColor.ERROR, { error });
	}
});
