import { Colors, EmbedBuilder, User } from "discord.js";

export default function endEmbed(
	type: "TIME" | "CONFIRM" | "CANCEL",
	matchId?: string,
	opponent?: User
): EmbedBuilder {
	if (type === "CONFIRM") {
		return new EmbedBuilder({
			color: Colors.Green,
			description: `### سوف تصل رسالة الى ${opponent} لتأكيد المباراة، يمكنك كذلك طلب منه تأكيد المباراة عن طريق الامر التالي \n\n\`/confirm ${matchId}\``,
			thumbnail: {
				url: opponent?.avatarURL() || "",
			},
		});
	} else if (type === "CANCEL") {
		return new EmbedBuilder({
			color: Colors.Grey,
			description: "# ❎ تم الإلغاء",
		});
	} else {
		return new EmbedBuilder({
			color: Colors.Red,
			description: "# ⌛ انتهى الوقت",
		});
	}
}
