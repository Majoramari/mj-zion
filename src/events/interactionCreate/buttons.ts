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

		const currentDate = new Date();
		const year = currentDate.getFullYear();
		const month = String(currentDate.getMonth() + 1).padStart(2, "0");
		const day = String(currentDate.getDate()).padStart(2, "0");
		let hours = currentDate.getHours();
		const minutes = String(currentDate.getMinutes()).padStart(2, "0");
		const amOrPm = hours >= 12 ? "PM" : "AM";

		hours = hours % 12 || 12;

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
					text: `بتاريخ: ${year}/${month}/${day} - ${hours}:${minutes}${amOrPm}`,
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
				logChannel.send({
					embeds: [
						new EmbedBuilder({
							color: Colors.Orange,
							description: `### قام <@${interaction.user.id}> برفض مبارة\nالسبب:\n\n\n\`\`\`${
								reason || "لم يقدم سبب"
							}\`\`\``,
							fields: [
								{ inline: true, name: "🏆 فائز:", value: `<@${deletedMatchData.winnerId}>` },
								{ inline: true, name: "🏳️ خاسر:", value: `<@${deletedMatchData.defeatedId}>` },
								{ inline: true, name: "🕹️ العبة:", value: deletedMatchData.game },
							],
							footer: {
								text: `بتاريخ: ${year}/${month}/${day} - ${hours}:${minutes}${amOrPm}`,
							},
						}),
					],
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
