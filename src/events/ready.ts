import { white } from "colorette";
import { LoggerColor, clearChannel, event, log, startupCheck } from "../utils";

export default event("ready", async ({ client }) => {
	log(`${client.user?.tag || "bot"} ${white("is online and ready to serve!")}`, LoggerColor.READY);
	startupCheck(client);
	// await clearChannel(client);
});
