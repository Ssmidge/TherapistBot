import { App as BoltApp, Context, SlashCommand, RespondFn, SlackCommandMiddlewareArgs, AllMiddlewareArgs } from "@slack/bolt";
import Command, { Argument } from "../types/slack/SlackCommand.mts";
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js";
import getSlackTokens from "../functions/slack/slackTokenFetch.mts";
import { listRoleAssignments } from "../functions/slack/slackEndpoints.mts";
import { installationStore } from "../index.mts";
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
        const executingUser = await client.users.info({ user: body.user_id });

        const roleAssignments = await listRoleAssignments({
            entity_ids: [body.channel_id],
            role_ids: ['Rl0A'],
        });
        const channelManagers: string[] = roleAssignments.role_assignments?.find((role) => role.role_id === "Rl0A")!.users || [];
        if (!executingUser.user?.id || !channelManagers.includes(executingUser.user.id.toString())) {
            await respond({
                text: `You are not authorized to use this command.`,
                thread_ts: body.ts,
            });
            return;
        }

        // option one: ping everyone
        // await client.chat.postMessage({ channel: body.channel_id, text: channelData.members?.map((member) => `<@${member}>`).join(" ") });
        // option 2: make a user group, ping it, delete it
        // const userGroup = await client.usergroups.create({ name: "temp", handle: `temp-${Date.now()}`, channels: body.channel_id });
        // if (!userGroup.ok) return await respond({ text: `Failed to create user group.` });
        // await client.usergroups.users.update({ usergroup: userGroup.usergroup?.id!, users: channelData.members?.join(",")! });
        // console.log(await client.usergroups.users.list({ usergroup: userGroup.usergroup?.id! }));
        // await client.usergroups.disable({ usergroup: userGroup.usergroup?.id! });
        

        await respond({ text: `Mentioned everyone in the channel.` });

    }
    
}