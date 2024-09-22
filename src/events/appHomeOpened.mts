import { SlackEventMiddlewareArgs, AllMiddlewareArgs } from "@slack/bolt";
import Event from "../types/slack/SlackEvent.mts";
import type { StringIndexed } from "@slack/bolt/dist/types/helpers.d.ts";

export default class AppHomeOpened extends Event {
    name = "app_home_opened";
    once = false;
    async execute({ event, client }: SlackEventMiddlewareArgs<"app_home_opened"> & AllMiddlewareArgs<StringIndexed>) {
        try {
            client.views.publish({
                user_id: event.user,
                view: {
                    "type": "home",
                    "blocks": [
                        {
                            "type": "header",
                            "text": {
                                "type": "plain_text",
                                "text": ":explodyparrot: Adrian's therapist's master control center :explodyparrot:",
                                "emoji": true
                            }
                        },
                        {
                            "type": "divider"
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "Coming soon!"
                            }
                        }
                    ]
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
}