import threadsJson from "../assets/threads.json";

export interface GamesArray {
	name: string;
	value: string;
	image: string;
	category: string;
}

export const gamesArray = () => {
	const gamesArray = new Map<string, GamesArray>();

	for (const threadJson of threadsJson) {
		for (const game of threadJson.games) {
			const formattedGame: GamesArray = {
				name: game.name
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" "),
				value: game.name,
				image: game.image,
				category: threadJson.category,
			};
			gamesArray.set(game.name, formattedGame);
		}
	}
	return gamesArray;
};
