import type { StringIndexed } from "@slack/bolt/dist/types/helpers.d.ts";
import { loadFiles } from "../functions/fileLoader.mts";
import Handler from "../types/slack/SlackHandler.mts";
import { App as BoltApp, Middleware, SlackEventMiddlewareArgs, AllMiddlewareArgs, SlackActionMiddlewareArgs, SlackAction } from "@slack/bolt";
import Action from "../types/slack/SlackAction.mts";

export default class ActionHandler extends Handler {

    constructor(client: BoltApp) {
        super(client);
    }

    async handle() {
        console.log("Action Handler");
        const files = await loadFiles("actions") as string[];

        files.sort((a: string, b: string) => {
            const aFileName = a.split("/").pop() ?? "";
            const bFileName = b.split("/").pop() ?? "";
            return aFileName.split(".")[0].length - bFileName.split(".")[0].length || aFileName.split(".")[0].localeCompare(bFileName.split(".")[0]);
        });

        files.forEach(async (file) => {
            const slackAction : Action = new(await import(`file://${file}`).then((event) => event.default));

            const execute = (args: SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs<StringIndexed>) => {
                const { context, say, action, client, payload, body, logger, next, respond, ack } = args;
                slackAction.execute({ context, say, action, client, payload, body, logger, next, respond, ack });
            };

            this.client.actions.set(slackAction.id as string, execute as unknown as Promise<void>);

            this.client.action(slackAction.id as string, execute as Middleware<SlackActionMiddlewareArgs>);
        });

    }

}