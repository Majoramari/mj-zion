import { Colors, EmbedBuilder, User } from "discord.js";
import { gamesArray } from "../../../utils";

export default (winnerPlayer: User, game: string) => {
	const gameInfo = gamesArray().get(game);

	if (!gameInfo)
		throw new Error("MJ - 400IPR That's an impossible error please contact the developer");

	return new EmbedBuilder({
		color: Colors.Orange,
		description: `هل ${winnerPlayer} فاز في مباراة 1v1 في لعبة **${gameInfo.name}**؟`,
		thumbnail: {
			url: gameInfo.image,
		},
		fields: [
			{ inline: true, name: "🏆 الفائز:", value: `${winnerPlayer}` },
			{ inline: true, name: "🏳️ الخاسر:", value: "أنت" },
			{ inline: true, name: "🕹️ العبة:", value: gameInfo.name },
		],
	});
};
