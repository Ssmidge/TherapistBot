import axios from "axios";
import getSlackTokens from "./slackTokenFetch.mts";
import { AdminRolesListAssignmentsArguments, AdminRolesListAssignmentsResponse, CustomAdminRolesListAssignmentsResponse } from "@slack/web-api";
import type { ResponseMetadata } from "@slack/web-api/dist/types/response/AdminRolesListAssignmentsResponse.d.ts";
import FormData from "form-data";

export async function listRoleAssignments(args: AdminRolesListAssignmentsArguments): Promise<CustomAdminRolesListAssignmentsResponse> {
    const { xoxdToken, xoxcToken } = await getSlackTokens();
    const data = new FormData();
    data.append('token', xoxcToken);
    data.append('entity_id', (args?.entity_ids as Array<string>)[0]);
    data.append("role_ids", (args?.role_ids as Array<string>).join(","));

    const res = await axios({
        url: "https://hackclub.slack.com/api/admin.roles.entity.listAssignments",
        method: "POST",
        maxBodyLength: Infinity,
        headers: {
            Cookie: `d=${xoxdToken};`,
            "Content-Type": "application/json",
            ...data.getHeaders(),
        },
        data,
    });

    return res.data as CustomAdminRolesListAssignmentsResponse;
}

declare module '@slack/web-api' {
    interface RoleAssignment {
        date_create?: number;
        entity_id?: string;
        role_id?: string;
        user_id?: string;
        users?: string[];
    }

    interface CustomAdminRolesListAssignmentsResponse {
        error?: string;
        needed?: string;
        ok?: boolean;
        provided?: string;
        response_metadata?: ResponseMetadata;
        role_assignments?: RoleAssignment[];
    }
}