import { drizzle, ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { use, createContext, type PropsWithChildren, useState } from 'react';

import * as schema from '@/db/schema';

export type GlobalContextType = {
    dataStore: any;
    user?: schema.User;
    loading: boolean;
    loadUserError: boolean;
    fetchUserFromDatabase: () => void;
    setUserAfterSetup: (user:schema.User | undefined) => void;
};

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
    const [user, setUser] = useState<schema.User | undefined>();

    const db = useSQLiteContext();
    const dataStore = drizzle(db, { schema });

    const fetchUserFromDatabase = async () => {
        try {
            setLoadUserError(false);
            setLoading(true);

            const appUser = await dataStore.query.user.findFirst();
            if(appUser){
                setUser(appUser);
            }
        } catch(e){
            setLoadUserError(true);
        } finally {
            setLoading(false);
        }
    }

    const setUserAfterSetup = (user:schema.User | undefined) => {
        setUser(user);
    }

    return (
        <GlobalContext.Provider
            value={{dataStore, user, loading, loadUserError, fetchUserFromDatabase, setUserAfterSetup}}
        >
            {children}
        </GlobalContext.Provider>
    )

}
