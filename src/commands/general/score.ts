import { Colors, EmbedBuilder, SlashCommandBuilder, User } from "discord.js";
import { GamesArray, LoggerColor, command, gamesArray, log } from "../../utils";

const options: Omit<GamesArray, "category">[] = Array.from(gamesArray().values()).map(
	({ category, ...rest }) => rest
);

export default command(
	new SlashCommandBuilder()
		.setName("score")
		.setDescription("لرؤية نقاطك أو نقاط لاعب أخر")
		.addStringOption((option) =>
			option
				.setName("game")
				.setDescription("The game")
				.setRequired(true)
				.addChoices(...options)
		)
		.addUserOption((option) =>
			option.setName("player").setDescription("the player").setRequired(false)
		),
	async ({ client, interaction }) => {
		const game = interaction.options.getString("game");
		const player: User = interaction.options.getUser("player") || interaction.user;

		// ! Checkers
		if (!game) throw new Error("MJ - 402NG please contact the developer, contact@majoramari.com");
		if (!player) throw new Error("MJ - 402NP please contact the developer, contact@majoramari.com");

		try {
			const score = client.database.getPlayerScore(player.id, game);

			const embed = new EmbedBuilder({
				color: Colors.Aqua,
				fields: [
					{ name: "اللاعب", value: `${player}`, inline: true },
					{ name: "النقاط", value: `${score}`, inline: true },
					{ name: "اللعبة", value: `${gamesArray().get(game)?.name}`, inline: true },
				],
				thumbnail: {
					url: player.displayAvatarURL(),
				},
			});

			await interaction.reply({
				ephemeral: true,
				embeds: [embed],
			});
		} catch (error) {
			log(`${error}`, LoggerColor.ERROR);
		}
	}
);
