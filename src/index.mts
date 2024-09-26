import "dotenv/config";
import Bolt, { LogLevel } from "@slack/bolt";
import EventHandler from "./handlers/EventHandler.mts";
import ActionHandler from "./handlers/ActionHandler.mts";
import MongoDBInstallationStore from "./types/slack/internal/MongoDBInstallationStore.mts";
import Database from "./types/database/Database.mts";
import MongoDatabase from "./types/database/mongo/MongoDatabase.mts";
import { Mongoose } from "mongoose";
import { ServerResponse } from 'http';
import { ParamsIncomingMessage } from "@slack/bolt/dist/receivers/ParamsIncomingMessage.js";
import CommandHandler from "./handlers/CommandHandler.mts";

const boltApp = new Bolt.App({
    signingSecret: process.env.SLACK_BOT_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_BOT_APP_TOKEN,
    logLevel: LogLevel.INFO,
    clientId: process.env.SLACK_BOT_CLIENT_ID,
    clientSecret: process.env.SLACK_BOT_CLIENT_SECRET,
    stateSecret: process.env.SLACK_BOT_STATE_SECRET,
    installationStore: new MongoDBInstallationStore(),
    scopes: [
        "channels:history",
        "channels:read",
        "chat:write",
        "chat:write.customize",
        "commands",
        "groups:history",
        "groups:read",
        "users:read",
    ],
    redirectUri: "https://localhost:3000/slack/redirect",
    installerOptions: {
        redirectUriPath: "/slack/redirect",
    },
    port: process.env.SLACK_PORT ? parseInt(process.env.SLACK_PORT) : 3000,
    customRoutes: [
        {
            path: "/status",
            method: ["GET"],
            handler: async (req: ParamsIncomingMessage, res: ServerResponse) => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "OK", slack: "OK", database: `${database.getClient().connection.readyState == 1 ? "OK" : "ERROR"}` }));
            },
        }
    ]
});
boltApp.events = new Map();
boltApp.actions = new Map();
boltApp.commands = new Map();

// Connect to the DB

const database : Database<Mongoose> = new MongoDatabase();

await database.connect();

const handlers = [];

handlers.push(new EventHandler(boltApp));
handlers.push(new ActionHandler(boltApp));
handlers.push(new CommandHandler(boltApp));

await boltApp.start();

handlers.forEach(async (handler) => await handler.handle());


declare module "@slack/bolt" {
    interface App {
        events: Map<string, Promise<void>>;
        actions: Map<string, Promise<void>>;
        commands: Map<string, Promise<void>>;
    }
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            SLACK_BOT_TOKEN: string;
            SLACK_BOT_SIGNING_SECRET: string;
            SLACK_BOT_APP_TOKEN: string;
            SLACK_BOT_CLIENT_ID: string;
            SLACK_BOT_CLIENT_SECRET: string;
            SLACK_BOT_STATE_SECRET: string;
            SLACK_PORT?: string;
            SLACK_AUTHORIZED_USERS: string[];
            SLACK_WELCOME_CHANNELS: string[];

            // Database
            DATABASE_MONGODB_URI: string;
        }
    }
}
