import { Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { GamesArray, command, gamesArray } from "../../utils";

const options: Omit<GamesArray, "category">[] = Array.from(gamesArray().values()).map(
	({ category, ...rest }) => rest
);

export default command(
	new SlashCommandBuilder()
		.setName("top")
		.setDescription("لعرض افضل 15 لاعب في كل لعبة")
		.addStringOption((option) =>
			option
				.setName("game")
				.setDescription("The game")
				.setRequired(true)
				.addChoices(...options)
		),
	async ({ client, interaction }) => {
		const game = interaction.options.getString("game");

		// ! Checkers
		if (!game) throw new Error("MJ - 402NG please contact the developer, contact@majoramari.com");

		const topPlayers = client.database.getTopPlayers(game);

		const topPlayersList = topPlayers
			.map((playerData, index) => {
				const position =
					index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `**${index + 1}** -`;
				return `${position} <@${playerData.playerId}> [${playerData.score}]`;
			})
			.join("\n");

		const embed = !!topPlayersList
			? new EmbedBuilder({
					color: Colors.Gold,
					title: `🎖️ قائمة بأفضل 15 لاعب في ${game
						.split("-")
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(" ")}`,
					description: topPlayersList,
			  })
			: new EmbedBuilder({
					color: Colors.Red,
					description: "**لم تحتسب اي نقاط لاي لاعب في هذة العبة**",
			  });

		interaction.reply({
			ephemeral: true,
			embeds: [embed],
		});
	}
);
