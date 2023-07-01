import { ComponentType, ModalData } from "discord.js";
import { LoggerColor, event, log } from "../../utils";

export default event("interactionCreate", async ({ client }, interaction) => {
	if (!interaction.isModalSubmit()) return;

	try {
		if (interaction) {
			const modalData = interaction.fields.getField("submit-decline", ComponentType.TextInput);
			if (!modalData) return;

			const reason = modalData;

			console.log(interaction.message?.content);
		}
	} catch (error) {
		log(`${error}`, LoggerColor.ERROR);
	}
});
