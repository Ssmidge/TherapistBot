import { SlackEventMiddlewareArgs, AllMiddlewareArgs } from "@slack/bolt";
import Event from "../types/slack/SlackEvent.mts";
import type { StringIndexed } from "@slack/bolt/dist/types/helpers.d.ts";

export default class AppHomeOpened extends Event {
    name = "member_joined_channel";
    once = false;
    async execute({ event, client, say }: SlackEventMiddlewareArgs<"member_joined_channel"> & AllMiddlewareArgs<StringIndexed>) {
        try {

            if (!process.env.SLACK_WELCOME_CHANNELS.includes(event.channel)) return;

            const user = await client.users.info({ user: event.user });
            if (!user.ok) return;

            const initialMessage = await say(`Hey there, <@${user.user?.id}>! Please click the red button in this message's thread to get started!`);
            // signing your life away button
            const text = `I, ${user.user?.real_name}, am signing my life away. I am now eternally bound to this mental asylum. By clicking the button below, I agree to the terms and conditions of this mental asylum.`;
            client.chat.postMessage({
                thread_ts: initialMessage.ts,
                channel: initialMessage.channel!,
                text,
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "plain_text",
                            text,
                            emoji: true
                        }
                    },
                    {
                        type: "actions",
                        elements: [
                            {
                                type: "button",
                                text: {
                                    type: "plain_text",
                                    text: "I am signing my life away",
                                    emoji: true
                                },
                                style: "danger",
                                value: `${user.user?.id}-agreed`,
                                action_id: "join_signed_agreed"
                            }
                        ]
                    }
                ],
            });
        } catch (error) {
            console.error(error);
        }
    }
}