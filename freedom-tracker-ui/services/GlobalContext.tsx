import { drizzle } from 'drizzle-orm/expo-sqlite';
import { asc, desc } from 'drizzle-orm';
import { useSQLiteContext } from 'expo-sqlite';
import { use, createContext, type PropsWithChildren, useState } from 'react';

import * as schema from '@/db/schema';
import useTeller from './TellerService';
import { AccountDetailsRequest } from '@/types/teller';

export type GlobalContextType = {
    dataStore: any;
    user?: GlobalUser | undefined;
    loading: boolean;
    loadUserError: boolean;
    fetchUserFromDatabase: () => void;
    updateUserState: (user: GlobalUser | undefined) => void;
    updateLoadingState: (loading: boolean) => void;
};

export type GlobalUser = {
    id: number;
    nickname: string;
    goals: schema.Goal[];
    connections: schema.Connection[];
    accounts: schema.Account[];
    transactions: schema.Transaction[];
}

const GlobalContext = createContext<GlobalContextType | null>(null);

export const useGlobalContext = () => {
    const value = use(GlobalContext);
    if (!value) {
        throw new Error('useGlobalContext must be wrapped in a GlobalContextProvider');
    }

    return value;
}

export function GlobalContextProvider({ children }: PropsWithChildren) {

    //const { fetchAndPersistAccountDetails } = useTeller();

    const [loading, setLoading] = useState<boolean>(true);
    const [loadUserError, setLoadUserError] = useState<boolean>(false);
    const [user, setUser] = useState<GlobalUser | undefined>();

    const db = useSQLiteContext();
    const dataStore = drizzle(db, { schema });

    const updateLoadingState = (loading:boolean) => {
        setLoading(loading);
    }

    const updateUserState = (updatedUser: GlobalUser | undefined) => {
        setUser(updatedUser);
    }

    const fetchUserFromDatabase = async () => {
        try {
            setLoadUserError(false);
            setLoading(true);

            const appUser = dataStore.query.user.findFirst();
            const connections = dataStore.query.connections.findMany();
            const accounts = dataStore.query.accounts.findMany();
            const goals = dataStore.query.goals.findMany();
            const transactions = dataStore.select().from(schema.transactions).orderBy(desc(schema.transactions.date));

            const [persistedUser, persistedConnections, persistedAccounts, persistedGoals, persistedTransactions]
                = await Promise.all([appUser, connections, accounts, goals, transactions]);

            if (persistedUser) {
                setUser({
                    id: persistedUser.id,
                    nickname: persistedUser.nickname,
                    goals: persistedGoals ?? [],
                    connections: persistedConnections ?? [],
                    accounts: persistedAccounts ?? [],
                    transactions: persistedTransactions ?? []
                });
            }
        } catch (e) {
            setLoadUserError(true);
        } finally {
            setLoading(false);
        }
    } 

    return (
        <GlobalContext.Provider
            value={{
                dataStore,
                user,
                loading,
                loadUserError,
                fetchUserFromDatabase,
                updateUserState,
                updateLoadingState
            }}
        >
            {children}
        </GlobalContext.Provider>
    )

}
