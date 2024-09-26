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
                    type: "home",
                    blocks: [
                        {
                            type: "header",
                            text: {
                                type: "plain_text",
                                text: ":explodyparrot: Adrian's therapist's master control center :explodyparrot:",
                                emoji: true
                            }
                        },
                        {
                            type: "divider"
                        },
                        {
                            type: "header",
                            text: {
                                type: "plain_text",
                                text: "Send a message as someone :eyes_wtf:",
                                emoji: true
                            }
                        },
                        {
                            type: "input",
                            block_id: "impersonate_username",
                            element: {
                                type: "plain_text_input",
                                action_id: "username",
                                placeholder: {
                                    type: "plain_text",
                                    text: "Therapist"
                                }
                            },
                            label: {
                                type: "plain_text",
                                text: "Username",
                                emoji: true
                            }
                        },
                        {
                            type: "input",
                            block_id: "impersonate_profile_picture",
                            element: {
                                type: "plain_text_input",
                                action_id: "profile_picture",
                                placeholder: {
                                    type: "plain_text",
                                    text: "https://avatars.githubusercontent.com/u/43932476?v=4"
                                }
                        },
                            label: {
                                type: "plain_text",
                                text: "Profile Picture",
                                emoji: true
                            }
                        },
                        {
                            type: "input",
                            block_id: "impersonate_text",
                            element: {
                                type: "plain_text_input",
                                multiline: true,
                                action_id: "text",
                                placeholder: {
                                    type: "plain_text",
                                    text: "hii :D"
                                }
                        },
                            label: {
                                type: "plain_text",
                                text: "Text",
                                emoji: true
                            }
                        },
                        {
                            type: "actions",
                            block_id: "impersonate_channel",
                            elements: [
                                {
                                    type: "conversations_select",
                                    placeholder: {
                                        type: "plain_text",
                                        text: "Select conversation",
                                        emoji: true
                                    },
                                    action_id: "channel",
                                }
                            ]
                        },
                        {
                            type: "actions",
                            elements: [
                                {
                                    type: "button",
                                    text: {
                                        type: "plain_text",
                                        text: "Impersonate someone!",
                                        emoji: true
                                    },
                                    value: "click_me_123",
                                    action_id: "impersonate_user_submitted"
                                }
                            ]
                        }
                    ]
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
}