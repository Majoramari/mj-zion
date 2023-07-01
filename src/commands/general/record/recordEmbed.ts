import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	User,
} from "discord.js";
import { MjClient } from "../../../client";
import { gamesArray } from "../../../utils";

const hasPlayedBefore = (
	client: MjClient,
	winnerPlayer: User,
	opponentPlayer: User,
	game?: string
) => {
	return game ? client.database.hasPlayedBefore(game, winnerPlayer.id, opponentPlayer.id) : null;
};

export default (
	client: MjClient,
	gamesThreads: { name: string; image: string }[],
	winnerPlayer: User,
	opponentPlayer: User,
	gameRow?: string
) => {
	const gameData = gamesArray();
	const gameInfo = gameRow ? gameData.get(gameRow) : null;

	const selectMenuOptions = gamesThreads.map((gameThread) => {
		const game = gameData.get(gameThread.name);
		if (!game) throw new Error("MJ - 403J Please check the threads configurations in treads.json");
		return new StringSelectMenuOptionBuilder().setLabel(game.name).setValue(game.value);
	});

	const playedGameBefore = hasPlayedBefore(client, winnerPlayer, opponentPlayer, gameInfo?.value);

	const playedBeforeConfirmed = playedGameBefore ? playedGameBefore.isConfirmed : false;

	const select = new StringSelectMenuBuilder()
		.setCustomId("game-select-menu")
		.setPlaceholder(gameInfo?.name ? `✅ ${gameInfo?.name}` : "اختر لعبة")
		.addOptions(selectMenuOptions);

	const confirmBtn = new ButtonBuilder({
		customId: "confirm",
		label: "تأكيد",
		style: ButtonStyle.Secondary,
		disabled: playedBeforeConfirmed,
	});

	const cancelBtn = new ButtonBuilder({
		customId: "cancel",
		label: "إلغاء",
		style: ButtonStyle.Danger,
	});

	const rowButtons = new ActionRowBuilder<ButtonBuilder>().addComponents([confirmBtn, cancelBtn]);

	const rowSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

	const embed = new EmbedBuilder({
		color: Colors.Orange,
		description: playedBeforeConfirmed
			? `⚠️ لقد تم تسجيل هذة المبارة سابقاً وفاز<@${playedGameBefore!.winnerId}> `
			: "## هل هذة المعلومات صحيحة؟",
		fields: [
			{ inline: true, name: "🏆 الفائز:", value: `${winnerPlayer}` },
			{ inline: true, name: "🏳️ الخاسر:", value: `${opponentPlayer}` },
			{ inline: true, name: "🕹️ العبة:", value: gameInfo?.name || "`لم تحدد`" },
		],
		footer: {
			text: `⚠️ سيطلب من ${opponentPlayer.username} تأكيد المباراة`,
		},
	});

	if (gameInfo) {
		embed.setImage(gameInfo.image);
	}

	return {
		ephemeral: true,
		embeds: [embed],
		components: gameInfo?.name ? [rowSelect, rowButtons] : [rowSelect],
	};
};
