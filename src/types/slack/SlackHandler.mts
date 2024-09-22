import { App as BoltApp } from "@slack/bolt";

export default abstract class Handler {
    client: BoltApp;

    constructor(client: BoltApp) {
        this.client = client;
    }

    abstract handle(): Promise<void>;

}