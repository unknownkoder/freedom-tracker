import { TellerAccountResponse, TellerConnectResponse } from "@/types/teller";
import * as schema from "@/db/schema";
import { GlobalUser } from "../GlobalContext";
import { GlobalContextReducers } from "@/types/services";

export const updateGlobalUserWithNewConnectionAndAccount = async (
    enrollment: TellerConnectResponse,
    account: TellerAccountResponse,
    persistConnection: (connection: schema.Connection, userId: number) => Promise<schema.Connection>,
    persistAccount: (account: schema.Account, connectionId: number) => Promise<schema.Account>,
    setUser: (user?: GlobalUser) => void,
    user?: GlobalUser
): Promise<void> => {
    if (user) {
        try {
            const connection: schema.Connection = {
                id: 0,
                accessToken: enrollment.accessToken,
                enrollmentId: enrollment.enrollment.id,
                tellerUserId: enrollment.user.id,
                userId: user.id
            }
            const persistedConnection = await persistConnection(connection, user.id);

            const accountToPersist: schema.Account = {
                id: account.id,
                name: account.name,
                institution: account.institution.name,
                lastFour: account.last_four,
                isPrimary: false,
                status: account.status,
                subtype: account.subtype,
                type: account.type,
                currency: account.currency,
                balance: '0.0',
                connectionId: persistedConnection.id
            }
            const persistedAccount = await persistAccount(accountToPersist, persistedConnection.id);
            const currentConnections = user?.connections ?? [];
            const currentAccounts = user?.accounts ?? [];
            setUser({
                ...user,
                connections: [...currentConnections, persistedConnection],
                accounts: [...currentAccounts, persistedAccount]
            })
        } catch (e) {
            console.log(e);
        }
    }
}
