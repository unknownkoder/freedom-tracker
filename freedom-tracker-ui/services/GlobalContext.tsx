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
    loadUserAccountInfo: () => void;
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

    const { fetchAndPersistAccountDetails } = useTeller();

    const [loading, setLoading] = useState<boolean>(true);
    const [loadUserError, setLoadUserError] = useState<boolean>(false);
    const [user, setUser] = useState<GlobalUser | undefined>();

    const db = useSQLiteContext();
    const dataStore = drizzle(db, { schema });

    const updateUserState = (updatedUser: GlobalUser | undefined) => {
        //console.log("updating user state to: ", updatedUser);
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
            //console.log(transactions);

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

    const loadUserAccountInfo = async () => {
        setLoading(true);
        if (user) {
            const accounts = user.accounts;
            const connections = user.connections;
            const transactions = user.transactions;
            const accountDetailsRequestBody: AccountDetailsRequest[] = accounts.map((account) => {
                const accessToken = connections.filter(connection => connection.id === account.connectionId)[0].accessToken;
                let transactionId = '';
                if (transactions.length && transactions.some((t => t.accountId === account.id))) {
                    const lastAccountTransaction = transactions.filter(t => t.accountId === account.id)[0];
                    transactionId = lastAccountTransaction.id;
                }

                const body = transactionId !== '' ?
                    {
                        accountId: account.id,
                        accessToken: accessToken ?? '',
                        transactionId
                    }
                    :
                    {
                        accountId: account.id,
                        accessToken: accessToken ?? ''
                    }
                return body;
            })

            try {
                const { accounts, transactions } = await fetchAndPersistAccountDetails(accountDetailsRequestBody);
                updateUserState({
                    ...user,
                    accounts,
                    transactions
                })
                setLoading(false);
            } catch (e) {
                console.log(e);
            }

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
                loadUserAccountInfo
            }}
        >
            {children}
        </GlobalContext.Provider>
    )

}
