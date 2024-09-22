import { AllMiddlewareArgs, SlackActionMiddlewareArgs, SlackAction } from "@slack/bolt";
import type { StringIndexed } from "@slack/bolt/dist/types/helpers.d.ts";

export default abstract class Action {
    abstract id: string;
    abstract execute({ context, action, client, respond, ack }: SlackActionMiddlewareArgs<SlackAction> & AllMiddlewareArgs<StringIndexed>): Promise<void>;
}