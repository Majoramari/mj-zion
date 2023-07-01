import { SlashCommandBuilder } from "discord.js";
import { command } from "../../utils";

export default command(
	new SlashCommandBuilder().setName("fake").setDescription("fake a data"),
	({ client, interaction }) => {
		if (interaction.user.id !== "309626033680941056")
			return interaction.reply({
				content: "You want something fake? talk to woman...",
			});

		client.database.recordMatch({
			game: "overwatch",
			winnerId: "123",
			defeatedId: "456",
			isConfirmed: true,
		});

		client.database.recordMatch({
			game: "overwatch",
			winnerId: "123",
			defeatedId: "464556",
			isConfirmed: true,
		});

		client.database.recordMatch({
			game: "overwatch",
			winnerId: "123",
			defeatedId: "465464556",
			isConfirmed: true,
		});

		client.database.recordMatch({
			game: "overwatch",
			winnerId: "234",
			defeatedId: "567",
			isConfirmed: true,
		});

		client.database.recordMatch({
			game: "overwatch",
			winnerId: "234",
			defeatedId: "55167",
			isConfirmed: true,
		});

		client.database.recordMatch({
			game: "overwatch",
			winnerId: "345",
			defeatedId: "678",
			isConfirmed: true,
		});

		client.database.recordMatch({
			game: "valorant",
			winnerId: "456",
			defeatedId: "123",
			isConfirmed: true,
		});

		client.database.recordMatch({
			game: "valorant",
			winnerId: "567",
			defeatedId: "435",
			isConfirmed: true,
		});
	}
);
