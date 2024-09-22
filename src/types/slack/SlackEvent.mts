import { SlackEventMiddlewareArgs, AllMiddlewareArgs } from "@slack/bolt";
import type { StringIndexed } from "@slack/bolt/dist/types/helpers.d.ts";

export default abstract class Event {
    abstract name: string;
    once: boolean = false;
    abstract execute({ context, say, event, client }: SlackEventMiddlewareArgs<string> & AllMiddlewareArgs<StringIndexed>): Promise<void>;
}