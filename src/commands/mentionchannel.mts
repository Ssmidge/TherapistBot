import { App as BoltApp, Context, SlashCommand, RespondFn, SlackCommandMiddlewareArgs, AllMiddlewareArgs } from "@slack/bolt";
import Command, { Argument } from "../types/slack/SlackCommand.mts";
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js";

export default class MentionChannel extends Command {

    constructor ({ client }: { client: BoltApp }) {
        super({
            name: "mention-channel",
            description: "Mentions everyone in a channel to replace @channel for people without Workspace Admin, can only be used by channel managers.",
            usage: "/mention-channel",
            client,
        })
    }

    async execute({ body, client, command, context, payload, respond }: SlackCommandMiddlewareArgs & AllMiddlewareArgs<StringIndexed>, args: Argument[]) {
        // Channel Managers for the current channel
        const executingUser = await client.users.info({ user: body.user_id });
        const channelData = await client.conversations.members({ channel: body.channel_id });
        console.log(channelData);
    }
    
}