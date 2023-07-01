import { LoggerColor, configs, event, log } from "../utils";

export default event("guildDelete", async ({}, guild) => {
	// * This check should be always occur
	if (configs.mainGuild === guild.id) {
		return log(
			"I'm not functional out of the main server, please invite me again!",
			LoggerColor.WARNING
		);
	}
});
