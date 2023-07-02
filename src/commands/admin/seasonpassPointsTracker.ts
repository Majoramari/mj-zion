import { Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js";
import { GamesArray, LoggerColor, command, gamesArray, log } from "../../utils";

const options: Omit<GamesArray, "category">[] = Array.from(gamesArray().values()).map(
	({ category, ...rest }) => rest
);

export default command(
	new SlashCommandBuilder()
		.setName("spp")
		.setDescription("shows participations points + winners")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
			const { score, wins, defeats } = client.database.getPlayerScoreWithDefeats(player.id, game);

			const wdr = !defeats ? 0 : wins / defeats;

			const embed = new EmbedBuilder({
				color: Colors.Aqua,
				fields: [
					{ name: "👤 اللاعب", value: `${player}`, inline: true },
					{ name: "🕹️ اللعبة", value: `${gamesArray().get(game)?.name}`, inline: true },
					{ name: "🎌 مرات الفوز", value: `**${wins}**`, inline: true },
					{ name: "🏳️ مرات الخسارة", value: `**${defeats}**`, inline: true },
					{ name: "🧮 نسبة الفوز للخسارة", value: `**${wdr}**`, inline: true },
					{ name: "💯 النقاط", value: `**${score}**`, inline: true },
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
