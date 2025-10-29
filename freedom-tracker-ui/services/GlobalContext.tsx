import { drizzle, ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { use, createContext, type PropsWithChildren, useState } from 'react';

import * as schema from '@/db/schema';

export type GlobalContextType = {
    dataStore: any;
    user?: GlobalUser;
    loading: boolean;
    loadUserError: boolean;
    fetchUserFromDatabase: () => void;
    updateUserState: (user: GlobalUser) => void;
};

export type GlobalUser = {
    id: number;
    nickname: string;
    connections: schema.Connection[];
    accounts: schema.Account[];
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

    const [loading, setLoading] = useState<boolean>(true);
    const [loadUserError, setLoadUserError] = useState<boolean>(false);
    const [user, setUser] = useState<GlobalUser | undefined>();

    const db = useSQLiteContext();
    const dataStore = drizzle(db, { schema });

    const updateUserState = (updatedUser: GlobalUser) => {
        console.log("updating user state to: ", updatedUser);
        setUser(updatedUser);
    }

    const fetchUserFromDatabase = async () => {
        try {
            setLoadUserError(false);
            setLoading(true);

            const appUser = await dataStore.query.user.findFirst();
            if(appUser){
                setUser({
                    id: appUser.id,
                    nickname: appUser.nickname,
                    connections: [],
                    accounts: []
                });
            }
        } catch(e){
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
                updateUserState
            }}
        >
            {children}
        </GlobalContext.Provider>
    )

}
