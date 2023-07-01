import { gray } from "colorette";

export const separator = (counter: number) => {
	if (counter >= 20) {
		counter = 0;
		console.log(`    ┗━━━━━━━━━━━━━━━┛
        
             ${gray("Made with ❤️ by MajorAmari")}
    
    ┏━━━━━━━━━━━━━━━┓`);
	}
};
