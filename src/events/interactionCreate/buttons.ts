import {
	ActionRowBuilder,
	ChannelType,
	Colors,
	ComponentType,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { LoggerColor, configs, event, log } from "../../utils";
import threads from "../../assets/threads.json";

export default event("interactionCreate", async ({ client }, interaction) => {
	if (!interaction.isButton()) return;
	try {
		const buttonsIdentifiers = RegExp(/^(confirm|cancel)-/);

		// TODO
		const currentDate = new Date();
		currentDate.setUTCHours(currentDate.getUTCHours() + 3); // Adjust for UTC+3 KSA timezone
		const year = currentDate.getUTCFullYear();
		const month = String(currentDate.getUTCMonth() + 1).padStart(2, "0");
		const day = String(currentDate.getUTCDate()).padStart(2, "0");
		let hours = currentDate.getUTCHours();
		const minutes = String(currentDate.getUTCMinutes()).padStart(2, "0");
		const amOrPm = hours >= 12 ? "PM" : "AM";

		hours = hours % 12 || 12;

		const formattedDate = `${year}/${month}/${day} - ${hours}:${minutes}${amOrPm}`;

		if (interaction.customId.startsWith("confirm-")) {
			const matchId = interaction.customId.replace(buttonsIdentifiers, "");
			const match = client.database.setMatchConfirmation(matchId, true);
			if (!match)
				return await interaction.update({
					embeds: [
						new EmbedBuilder({
							color: Colors.Red,
							description: "## حدث خطأ ما :(",
						}),
					],
					components: [],
				});

			const lvBot = client.users.cache.get(configs.lvBotId);

			if (!lvBot) throw new Error("MJ - 402NDM Not able to send messages to lvBot");

			lvBot
				.send({
					content: `{ "winnerId": "${match.winnerId}", "defeatedId": "${match.defeatedId}" }`,
				})
				.then(() => {
					log("Message sent to lvBot", LoggerColor.NONE);
				})
				.catch(() => {
					log("MJ - 404NDM Not able to send messages to lvBot");
				});

			const thread = threads.find((thread) =>
				thread.games.find((name) => name.name === match.game)
			);

			if (!thread) throw new Error("This is a configuration error please check it out");
			const threadPostChannel = client.channels.cache.get(thread.id);

			if (!threadPostChannel || threadPostChannel.type !== ChannelType.PublicThread)
				throw new Error("MJ - 402NC No channel found!");

			const gameData = client.gamesArray.get(match.game);

			const embed = new EmbedBuilder({
				color: Colors.Gold,
				fields: [
					{ inline: true, name: "🏆 الفائز:", value: `<@${match.winnerId}>` },
					{ inline: true, name: "🏳️ الخاسر:", value: `<@${match.defeatedId}>` },
					{ inline: true, name: "🕹️ العبة:", value: match.game },
				],
				image: {
					url: gameData!.image,
				},
				footer: {
					text: `بتاريخ: ${formattedDate}`,
				},
			});

			threadPostChannel.send({ embeds: [embed] });

			return await interaction.update({
				embeds: [
					new EmbedBuilder({
						color: Colors.Green,
						description: "## ✅ شكراً على التأكيد...\nنتمنى لك التوفيق في المباريات القادمة",
					}),
				],
				components: [],
			});
		}

		if (interaction.customId.startsWith("cancel-")) {
			const modal = new ModalBuilder().setCustomId("decline-modal").setTitle("سبب رفض التأكيد");

			const reasonInput = new TextInputBuilder()
				.setMinLength(3)
				.setMaxLength(512)
				.setPlaceholder("I didn't play this game")
				.setCustomId("submit-decline")
				.setLabel("What's some of your favorite hobbies?")
				.setStyle(TextInputStyle.Paragraph);

			const row = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);

			modal.addComponents(row);

			await interaction.showModal(modal);

			const response = await interaction.awaitModalSubmit({
				filter: (i) => i.user.id === interaction.user.id,
				time: 5000,
			});

			const modalData = response.fields.getField("submit-decline", ComponentType.TextInput);
			const reason = modalData.value;

			const logChannel = client.channels.cache.get(configs.logChannel);

			if (logChannel?.type !== ChannelType.GuildText)
				throw new Error("MJ - 403TX log channel is not of type text");

			const matchId = interaction.customId.replace(buttonsIdentifiers, "");
			const deletedMatchData = client.database.deleteMatchById(matchId);

			if (deletedMatchData) {
				logChannel
					.send({
						embeds: [
							new EmbedBuilder({
								color: Colors.Orange,
								description: `### قام <@${interaction.user.id}> برفض مبارة\nالسبب:\n\`\`\`${
									reason || "لم يقدم سبب"
								}\`\`\``,
								fields: [
									{ inline: true, name: "🏆 فائز:", value: `<@${deletedMatchData.winnerId}>` },
									{ inline: true, name: "🏳️ خاسر:", value: `<@${deletedMatchData.defeatedId}>` },
									{ inline: true, name: "🕹️ العبة:", value: deletedMatchData.game },
								],
								footer: {
									text: `بتاريخ: ${formattedDate}`,
								},
							}),
						],
					})
					.catch((error: Error) => {
						log(error.message, LoggerColor.ERROR);
					});
			}

			response.deferUpdate().catch((err) => {});
			return await interaction.editReply({
				embeds: [
					new EmbedBuilder({
						color: Colors.LightGrey,
						description: "## ❎ تم الالغاء",
					}),
				],
				components: [],
			});
		}
	} catch (error) {
		log(`${error}`, LoggerColor.ERROR);
	}
});
