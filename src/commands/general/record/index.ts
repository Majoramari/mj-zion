import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	Colors,
	EmbedBuilder,
	SlashCommandBuilder,
	StringSelectMenuInteraction,
} from "discord.js";
import { configs, LoggerColor, command, log } from "../../../utils";
import recordEmbed from "./recordEmbed";
import endEmbed from "./endEmbed";
import opponentEmbed from "./opponentEmbed";

const MINUTE = 60000;

export default command(
	new SlashCommandBuilder()
		.setName("1vs1")
		.setDescription("كتابة تفاصيل نتيجة مباراتك")
		.addUserOption((option) =>
			option.setName("opponent").setDescription("المنافس الذي خسر المباراة!").setRequired(true)
		),
	async ({ client, interaction }) => {
		const winnerPlayer = interaction.user;
		const opponentPlayer = interaction.options.getUser("opponent");
		let game: string;

		try {
			// Check if both players are valid
			if (!opponentPlayer || !winnerPlayer) {
				return await interaction.reply({
					ephemeral: true,
					content: "## حدث خطأ ما :(",
				});
			}

			// Check if the player played against themselves
			if (opponentPlayer.id === interaction.user.id) {
				return await interaction.reply({
					ephemeral: true,
					content: "فزت على نفسك؟ 🤨",
				});
			}

			// Check if the opponent is a bot
			if (opponentPlayer.bot) {
				return await interaction.reply({
					ephemeral: true,
					content: "فزت على بوت؟",
				});
			}
		} catch (error) {
			return log(`${error}`, LoggerColor.ERROR, { error });
		}

		/* 
    confirmation UI
    */

		try {
			const gamesThreads = client.getThreadGamesByThreadId(interaction.channelId);
			if (!gamesThreads) {
				return await interaction.reply({
					ephemeral: true,
					embeds: [
						new EmbedBuilder({
							color: Colors.Aqua,
							description: "## لم يتم تسجيل العاب لهذا التصنيف...",
						}),
					],
				});
			}

			const response = await interaction.reply(
				recordEmbed(client, gamesThreads, winnerPlayer, opponentPlayer)
			);

			const collector = await response.createMessageComponentCollector({
				filter: (i) => i.user.id === interaction.user.id,
			});
			setTimeout(() => collector.stop("TIME"), MINUTE);

			collector.on("collect", (i: StringSelectMenuInteraction | ButtonInteraction) => {
				if (i.isStringSelectMenu()) {
					game = i.values[0];
					i.update(recordEmbed(client, gamesThreads, winnerPlayer, opponentPlayer, game));
				}

				if (i.isButton()) {
					if (i.customId === "cancel") {
						interaction.editReply({
							embeds: [endEmbed("CANCEL")],
							components: [],
						});
						return collector.stop();
					}

					const recordedGame = client.database.recordMatch({
						game,
						winnerId: winnerPlayer.id,
						defeatedId: opponentPlayer.id,
					});

					const opponentButtonConfirm = new ButtonBuilder({
						customId: `confirm-${recordedGame.matchId}`,
						label: "تأكيد",
						style: ButtonStyle.Secondary,
					});

					const opponentButtonCancel = new ButtonBuilder({
						customId: `cancel-${recordedGame.matchId}`,
						label: "رفض",
						style: ButtonStyle.Danger,
					});

					const opponentRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
						opponentButtonConfirm,
						opponentButtonCancel,
					]);

					opponentPlayer.send({
						embeds: [opponentEmbed(winnerPlayer, game)],
						components: [opponentRow],
					});

					interaction.editReply({
						embeds: [endEmbed("CONFIRM", recordedGame.matchId, opponentPlayer)],
						components: [],
					});
					collector.stop();
				}
			});
			collector.on("end", () => {
				if (collector.endReason === "TIME")
					interaction.editReply({ embeds: [endEmbed("TIME")], components: [] });
			});
		} catch (error) {
			log(`${error}`, LoggerColor.ERROR, { error });
		}
	}
);
