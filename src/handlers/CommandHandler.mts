import type { StringIndexed } from "@slack/bolt/dist/types/helpers.d.ts";
import { loadFiles } from "../functions/fileLoader.mts";
import Handler from "../types/slack/SlackHandler.mts";
import { App as BoltApp, Middleware,  AllMiddlewareArgs, SlackCommandMiddlewareArgs } from "@slack/bolt";
import Command, { Argument } from "../types/slack/SlackCommand.mts";

export default class CommandHandler extends Handler {
    commands: Command[] = [];

    constructor(client: BoltApp) {
        super(client);
    }

    async handle() {
        console.log("Command Handler");
        const files = await loadFiles("commands") as string[];

        files.sort((a: string, b: string) => {
            const aFileName = a.split("/").pop() ?? "";
            const bFileName = b.split("/").pop() ?? "";
            return aFileName.split(".")[0].length - bFileName.split(".")[0].length || aFileName.split(".")[0].localeCompare(bFileName.split(".")[0]);
        });

        for(const file of files) {
            const slackCommand : Command = new(await import(`file://${file}`).then((event) => event.default))(this.client);

            const execute = async ({ ack, body, client, command, context, logger, next, payload, respond, say }: SlackCommandMiddlewareArgs & AllMiddlewareArgs<StringIndexed>, args: Argument[]) => {
                await slackCommand.execute({ ack, body, client, command, context, logger, next, payload, respond, say }, args);
            };

            this.commands.push(slackCommand);
            this.client.commands.set(slackCommand.name as string, execute as unknown as Promise<void>);
        }

        this.client.command(/.*?/, async ({ ack, body, command, respond, context, client, logger, next, payload, say }) => {
            await ack();
            await respond({ replace_original: true, text: "Processing your command..." });
            
            const commandName = command.command.replace("/", "").toLowerCase();
            const commandArguments = command.text.split(" ");

            const commandToExecute = this.commands.find((c) => {
                // if it's a subcommand, check for the commandName to be the first part for split . and the subcommand to be the second part
                if (c.subCommand) {
                    const [commandName, subCommand] = c.subCommand.split(".");
                    return commandName === commandName && subCommand === commandArguments[0];
                } else {
                    return c.name === commandName;
                }
            });

            if (!commandToExecute) {
                await respond({
                    text: `I'm sorry, I don't know what command \`/${commandArguments.length > 1 ? `${commandName} ${commandArguments[0]}` : commandName}\` is.`,
                    thread_ts: body.ts,
                });
                return;
            }

            try {
                await commandToExecute.execute({
                    context,
                    body,
                    command,
                    client,
                    logger,
                    next,
                    payload,
                    respond,
                    ack,
                    say,
                }, commandArguments.splice(1).map((argument) => {
                    const toReturn = commandToExecute.commandArguments[commandArguments.indexOf(argument) + 1];
                    toReturn.value = argument;
                    return toReturn;
                }));
            } catch (e: unknown) {
                await respond({
                    text: `An error occurred while executing the command ${commandName}.\n${e}`,
                    thread_ts: body.ts,
                });
                throw e;
            }

        });

    }

}