import { AllMiddlewareArgs, SlackActionMiddlewareArgs, SlackAction, ButtonAction, BlockAction } from "@slack/bolt";
import type { StringIndexed } from "@slack/bolt/dist/types/helpers.d.ts";
import Action from "../types/slack/SlackAction.mts";

export default class JoinContractSigned extends Action {
    id = "join_signed_agreed";
    async execute({ client, ack, body, respond }: SlackActionMiddlewareArgs<BlockAction<ButtonAction>> & AllMiddlewareArgs<StringIndexed>) {
        try {
            await ack();
            // check if the user is the one that's actually supposed to sign their life away
            if (body?.actions?.[0].value !== `${body.user?.id}-agreed`) {
                await client.chat.postEphemeral({
                    user: body.user?.id!,
                    channel: body.channel?.id!,
                    thread_ts: body.message?.ts!,
                    text: "You are not the one that's supposed to sign your life away. You are not allowed to do this _yet_.",
                    mrkdwn: true,
                });
                return;
            }
            // edit the message to say that the user has signed the contract
            const text = "You have signed the contract. You are now eternally bound to this mental asylum.";
            await client.chat.update({
                ts: body.message?.ts!,
                thread_ts: body.message?.ts!,
                channel: body.channel?.id!,
                text,
                blocks: [],
            });
            await client.chat.update({
                ts: body.message?.ts!,
                channel: body.channel?.id!,
                thread_ts: body.message?.ts!,
                reply_broadcast: true,
            });

            // delete all the evidence after 30 seconds
            const interval = setInterval(async () => {

                // thread replies
                const thread = await client.conversations.replies({ channel: body.channel?.id!, ts: body.message?.ts! });
                if (!thread.ok) return;

                if (thread.messages?.filter((message) => message.text === text).length === 0) return;

                thread.messages!.forEach(async (message) => {
                    await client.chat.delete({ ts: message.ts!, channel: body.channel?.id! });
                });

                // top-level message
                await client.chat.delete({ ts: thread.messages![0].thread_ts!, channel: body.channel?.id! });

                clearInterval(interval);
            }, 30 * 1 * 1000);
        } catch (error) {
            console.error(error);
        }
    }
}