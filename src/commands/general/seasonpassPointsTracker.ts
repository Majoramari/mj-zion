import { Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js";
import { GamesArray, LoggerColor, command, gamesArray, log } from "../../utils";

const options: Omit<GamesArray, "category">[] = Array.from(gamesArray().values()).map(
	({ category, ...rest }) => rest
);

export default command(
	new SlashCommandBuilder()
		.setName("spp")
		.setDescription("shows participations points + winners")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async ({ client, interaction }) => {
		// TODO
	}
);
