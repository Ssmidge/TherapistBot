import { Installation, InstallationQuery, InstallationStore } from "@slack/bolt";
import { InstallationStoreSchema } from "../../database/mongo/models/InstallationStore.mts";

export default class MongoDBInstallationStore implements InstallationStore {    
    async storeInstallation(installation: Installation): Promise<void> {
        if (installation.team === undefined) throw new Error("Team is required");
        console.log(`Storing installation for ${installation.team.id}`);
        await InstallationStoreSchema.findOneAndUpdate({
            teamId: installation.team.id,
        }, {
            userId: installation.user.id,
            teamId: installation.team.id,
            installation: installation,
            createdAt: Date.now(),
            updatedAt: Date.now(),    
        }, {
            upsert: true,
            new: true,
        });
    }

    async fetchInstallation(query: InstallationQuery<boolean>): Promise<Installation<"v1" | "v2", boolean>> {
        console.log(`Fetching installation for ${query.teamId}`);
        const installation = await InstallationStoreSchema.findOne({ teamId: query.teamId });
        if (installation === null) throw new Error("Installation not found");
        return installation.installation;
    }

    async deleteInstallation(query: InstallationQuery<boolean>): Promise<void> {
        console.log(`Deleting installation for ${query.teamId}`);
        await InstallationStoreSchema.deleteOne({ teamId: query.teamId });
    }
}