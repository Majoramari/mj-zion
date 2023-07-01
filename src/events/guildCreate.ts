import { white } from "colorette";
import { LoggerColor, configs, event, log } from "../utils";

export default event("guildCreate", async ({}, guild) => {
	if (configs.mainGuild === guild.id)
		return log(`I'm back to the main server and ready to serve!`, LoggerColor.READY);

	await guild.leave();
	log(`I left ${white(guild.name)} server!`, LoggerColor.WARNING);
});
