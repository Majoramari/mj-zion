import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { LoggerColor, command, log } from "../../utils";

const meta = new SlashCommandBuilder()
	.setName("confirm")
	.setDescription("لتأكيد نتيجة مباراة بإستعمال الكود")
	.addStringOption((option) =>
		option.setName("match").setDescription("الكود يبدأ بـ jmari-").setRequired(true)
	);

export default command(meta, async ({ client, interaction }) => {
	const matchId = interaction.options.getString("match");

	if (!matchId || !matchId.startsWith("jmari-"))
		return interaction
			.reply({
				ephemeral: true,
				embeds: [
					new EmbedBuilder({
						color: Colors.Red,
						description: "**الكود التعريفي للمباراة خطأ (الكود الصحيح يبدأ `jmari-`)**",
					}),
				],
			})
			.catch((err) => {
				log(err, LoggerColor.ERROR);
			});

	const match = client.database.getMatchById(matchId);

	if (!match)
		return interaction
			.reply({
				ephemeral: true,
				embeds: [
					new EmbedBuilder({
						color: Colors.Red,
						description: "**لم اعثر على مباراة**",
					}),
				],
			})
			.catch((err) => {
				log(err, LoggerColor.ERROR);
			});

	if (match.defeatedId !== interaction.user.id)
		return interaction
			.reply({
				ephemeral: true,
				embeds: [
					new EmbedBuilder({
						color: Colors.Red,
						description: `فقط <@${match.defeatedId}> هو من يستطيع تأكيد المباراة!`,
					}),
				],
			})
			.catch((err) => {
				log(err, LoggerColor.ERROR);
			});

	const opponentButtonConfirm = new ButtonBuilder({
		customId: `confirm-${match.matchId}`,
		label: "تأكيد",
		style: ButtonStyle.Secondary,
	});

	const opponentButtonCancel = new ButtonBuilder({
		customId: `cancel-${match.matchId}`,
		label: "رفض",
		style: ButtonStyle.Danger,
	});

	const opponentRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
		opponentButtonConfirm,
		opponentButtonCancel,
	]);

	const embed = new EmbedBuilder({
		color: Colors.Orange,
		description: "## هل هذة المعلومات صحيحة؟",
		fields: [
			{ inline: true, name: "🏆 الفائز:", value: `<@${match.winnerId}>` },
			{ inline: true, name: "🏳️ الخاسر:", value: `<@${match.defeatedId}>` },
			{ inline: true, name: "🕹️ العبة:", value: match.game },
		],
	});

	interaction.reply({ ephemeral: true, embeds: [embed], components: [opponentRow] });
});
