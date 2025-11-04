import { useGlobalContext } from "./GlobalContext";
import * as schema from "@/db/schema";

export default function useTeller(){
    const server = process.env.EXPO_PUBLIC_SERVER_URI;
    const {dataStore} = useGlobalContext();

    const fetchAccountsByAccessToken = async (accessToken:string) => {
        console.log(server);
        const res = await fetch(`http://${server}:8000/api/accounts`, {
            method: 'GET',
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        return data;
    }

    const persistConnection = async (connection:schema.Connection, userId: number) => {
        const persistedConnection = await dataStore.insert(schema.connections)
            .values({accessToken: connection.accessToken, enrollmentId: connection.enrollmentId, tellerUserId: connection.tellerUserId, userId})
            .returning();
        console.log(persistedConnection[0]);
        return persistedConnection[0];
    }

    const persistAccount = async (account:schema.Account, connectionId: number) => {
        const persistedAccount = await dataStore.insert(schema.accounts)
            .values({
                ...account,
                connectionId
            })
            .returning();
        console.log(persistedAccount[0]);
        return persistedAccount[0];
    }

    return {
        fetchAccountsByAccessToken,
        persistConnection,
        persistAccount
    }
}
