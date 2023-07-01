/* eslint-disable @typescript-eslint/no-explicit-any */
import { Event } from "../../types";
import commands from "./commands";
import buttons from "./buttons";

const events: Event<any>[] = [commands, buttons];

export default events;
