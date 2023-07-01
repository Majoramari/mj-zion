import { SlashCommandBuilder } from "discord.js";
import { command, gamesArray } from "../../utils";

export default command(
	new SlashCommandBuilder().setName("debug").setDescription("Debug"),
	async ({ client, interaction }) => {
		if (interaction.user.id !== "309626033680941056")
			return interaction.reply({
				content: "Any bugs? `contact@majoramari.com`",
			});
	}
);
