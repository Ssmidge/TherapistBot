import { SlackActionMiddlewareArgs, SlackAction, AllMiddlewareArgs, BlockAction, ErrorCode } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js";
import Action from "../types/slack/SlackAction.mts";

export default class ImpersonateUserSubmitted extends Action {
    id = "impersonate_user_submitted";
    async execute({ context, action, client, ack, body }: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs<StringIndexed>): Promise<void> {
        await ack();

        if (!process.env.SLACK_AUTHORIZED_USERS.includes(body.user.id)) {
            await client.chat.postEphemeral({
                user: body.user.id,
                channel: body.user.id,
                text: "You are not authorized to use this command.",
            });
            return;
        }

        const impersonateValues = body.view!.state.values;
        const username = impersonateValues.impersonate_username.username.value;
        const userProfilePicture = impersonateValues.impersonate_profile_picture.profile_picture.value;
        const text = impersonateValues.impersonate_text.text.value;
        const channelID = impersonateValues.impersonate_channel.channel.selected_conversation;

        if (!channelID || !username || !userProfilePicture || !text) {
            const missingFields = [];
            if (!channelID) missingFields.push("channel");
            if (!username) missingFields.push("username");
            if (!userProfilePicture) missingFields.push("profile picture");
            if (!text) missingFields.push("text");

            await client.chat.postEphemeral({
                user: body.user.id,
                channel: body.user.id,
                text: `Missing fields: ${missingFields.join(", ")}`,
            });
        }
        
        try {
            const channel = await client.conversations.info({ channel: channelID! });
            const channelData = await client.conversations.members({ channel: channelID! });

            if (!channel.ok) console.error(channel.error);
            if (!channel.channel?.is_member) {
                await client.chat.postEphemeral({
                    user: body.user.id,
                    channel: body.user.id,
                    text: "I am not a member of this channel. You cannot send messages to it.",
                });
                return;
            }

            await client.chat.postMessage({
                channel: channelID!,
                text: `${text!}`,
                username: username!,
                icon_url: userProfilePicture!,
            });

            if (text === "abc") {
                await client.chat.postMessage({
                    channel: channelID!,
                    text: channelData.members?.map((member) => `<@${member}>`).join(", "),
                    username: username!,
                    icon_url: userProfilePicture!,
                });

            }
        } catch (e: unknown) {
            const error = e as any;
            // channel_not_found
            switch (error.data.error) {
                case "channel_not_found":
                    await client.chat.postEphemeral({ user: body.user.id, channel: body.user.id, text: "I am not a member of this channel. You cannot send messages to it." });
                    return;
                default:
                    console.error(error);
            }

            console.error(error);
        }
    }
}