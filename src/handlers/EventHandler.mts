import type { StringIndexed } from "@slack/bolt/dist/types/helpers.d.ts";
import { loadFiles } from "../functions/fileLoader.mts";
import Event from "../types/slack/SlackEvent.mts";
import Handler from "../types/slack/SlackHandler.mts";
import { App as BoltApp, Middleware, SlackEventMiddlewareArgs, AllMiddlewareArgs } from "@slack/bolt";

export default class EventHandler extends Handler {

    constructor(client: BoltApp) {
        super(client);
    }

    async handle() {
        console.log("Event Handler");
        const files = await loadFiles("events") as string[];

        files.sort((a: string, b: string) => {
            const aFileName = a.split("/").pop() ?? "";
            const bFileName = b.split("/").pop() ?? "";
            return aFileName.split(".")[0].length - bFileName.split(".")[0].length || aFileName.split(".")[0].localeCompare(bFileName.split(".")[0]);
        });

        files.forEach(async (file) => {
            const slackEvent : Event = new(await import(`file://${file}`).then((event) => event.default));

            const execute = (args: SlackEventMiddlewareArgs<string> & AllMiddlewareArgs<StringIndexed>) => {
                const { context, say, event, client, payload, message, body, logger, next } = args;
                slackEvent.execute({ context, say, event, client, payload, message, body, logger, next });
            };

            this.client.events.set(slackEvent.name as string, execute as unknown as Promise<void>);

            this.client.event(slackEvent.name as string, execute as Middleware<SlackEventMiddlewareArgs>);

            // this.client.event("message", async ({ context, say }) => {
            //     console.log("Message Event");
            // });
        });

    }

}