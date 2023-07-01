/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	green,
	bold,
	cyan,
	bgGreen,
	black,
	bgRedBright,
	bgCyanBright,
	bgBlue,
	cyanBright,
	blue,
	yellow,
	bgYellow,
	redBright,
} from "colorette";
import { separator } from "./functions";
import { LoggerColor } from "./loggerColor";

let counter = 0;

export const logo = () => {
	console.log(
		`
    ${green(
			`
    ███╗░░░███╗░█████╗░░░░░░██╗░█████╗░██████╗░░█████╗░███╗░░░███╗░█████╗░██████╗░██╗
    ████╗░████║██╔══██╗░░░░░██║██╔══██╗██╔══██╗██╔══██╗████╗░████║██╔══██╗██╔══██╗██║
    ██╔████╔██║███████║░░░░░██║██║░░██║██████╔╝███████║██╔████╔██║███████║██████╔╝██║
    ██║╚██╔╝██║██╔══██║██╗░░██║██║░░██║██╔══██╗██╔══██║██║╚██╔╝██║██╔══██║██╔══██╗██║
    ██║░╚═╝░██║██║░░██║╚█████╔╝╚█████╔╝██║░░██║██║░░██║██║░╚═╝░██║██║░░██║██║░░██║██║
    ╚═╝░░░░░╚═╝╚═╝░░╚═╝░╚════╝░░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝░░╚═╝╚═╝
    `
		)}
           ${cyan(bold("This is bot created with ❤️ by MajorAmari - contact@majoramari.com"))}
  
    ┏━━━━━━━━━━━━━━━┓`
	);
};

export const log = (
	content: string,
	type: LoggerColor = LoggerColor.NONE,
	more?: {
		username?: string;
		error?: any;
	}
): void => {
	counter = counter === 20 ? 0 : ++counter;
	separator(counter);

	switch (type) {
		case LoggerColor.NONE:
			return console.log(`    ┃ [LOG]         ┃ ${content}`);
		case LoggerColor.READY:
			return console.log(`    ┃ ${black(bgGreen("[READY]"))}       ┃ ✅ ${green(content)} `);
		case LoggerColor.COMMAND:
			return console.log(
				`    ┃ ${black(bgCyanBright("[COMMAND]"))}     ┃ 📝 ${cyanBright(
					content
				)} invoked by ${black(bgCyanBright(more?.username || "unknown"))}`
			);
		case LoggerColor.EVENT:
			return console.log(
				`    ┃ ${black(bgBlue("[EVENT]"))}       ┃ 👂 ${blue(content)} Registered!`
			);
		case LoggerColor.WARNING:
			return console.log(`    ┃ ${black(bgYellow("[WARNING]"))}     ┃ ⚠️ ${yellow(content)}`);
		case LoggerColor.ERROR:
			if (more?.error) console.log(more.error);
			return console.log(`    ┃ ${black(bgRedBright("[ERROR]"))}       ┃ 💀 ${redBright(content)}`);

		default:
			throw new TypeError("Something went wrong in logger system :(");
	}
};
