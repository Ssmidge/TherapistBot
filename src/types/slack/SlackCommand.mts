import { App as BoltApp, Context, RespondFn, SlashCommand } from "@slack/bolt";

export default abstract class Command {
    name?: string;
    subCommand?: string;
    description: string;
    commandArguments: Argument[] = [];
    usage: string = `/command ${this.commandArguments.join(" ")}`;
    client: BoltApp;
    constructor ({ name, subCommand, description, usage, commandArguments, client } : { name?: string, subCommand?: string, description: string, usage?: string, commandArguments?: Argument[], client: BoltApp }) {
        if (name) this.name = name;
        if (subCommand) this.subCommand = subCommand;
        if (subCommand) this.name = subCommand.split(".")[1];
        this.description = description;
        if (usage) this.usage = usage;
        else this.usage = `${this.name} ${this.commandArguments.join(" ")}`;
        if (commandArguments) this.commandArguments = commandArguments;
        this.client = client;
    }

    get getName() {
        return this.name;
    }
    get getDescription() {
        return this.description;
    }
    get getUsage() {
        return this.usage;
    }
    get getCommandArguments() {
        return this.commandArguments;
    }

    abstract execute({ context, body, command }: { context: Context; body: SlashCommand; command: SlashCommand; }, args: Argument[], respond: RespondFn): Promise<void>;
}

export type Argument = {
    name: string;
    description: string;
    required: boolean;
    type: string;
    example: string;
    value?: string;
}