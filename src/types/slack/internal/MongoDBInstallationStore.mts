import { Installation, InstallationQuery, InstallationStore } from "@slack/bolt";
import { InstallationStoreSchema } from "../../database/mongo/models/InstallationStore.mts";

export default class MongoDBInstallationStore implements InstallationStore {    
    async storeInstallation(installation: Installation): Promise<void> {
        if (installation.team === undefined) throw new Error("Team is required");
        await InstallationStoreSchema.findOneAndUpdate({
            teamId: installation.team.id,
            userId: installation.user.id,
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
        let installation = await InstallationStoreSchema.findOne({
            teamId: query.teamId,
            userId: query.userId,
            installation: {
                $exists: true,
                $ne: null,     
            },
            $expr: {
                $eq: ['$installation.isEnterpriseInstall', query.isEnterpriseInstall],
            }
        });
        if (!installation && query.teamId) {
            installation = await InstallationStoreSchema.findOne({
                teamId: query.teamId,
                installation: {
                    $exists: true,
                    $ne: null,     
                },
                $expr: {
                    $eq: ['$installation.isEnterpriseInstall', query.isEnterpriseInstall],
                }
            });
            installation!.installation.user = null as any;
        }
        if (!installation) return null as any;
        return installation.installation;
    }

    async deleteInstallation(query: InstallationQuery<boolean>): Promise<void> {
        await InstallationStoreSchema.deleteOne({ teamId: query.teamId, userId: query.userId });
    }
}