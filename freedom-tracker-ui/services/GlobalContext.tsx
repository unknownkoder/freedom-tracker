import Constants from 'expo-constants';

/* DB related imports */
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { desc } from 'drizzle-orm';
import { useSQLiteContext } from 'expo-sqlite';
import { use, createContext, type PropsWithChildren, useState } from 'react';
import * as schema from '@/db/schema';

/* Teller service imports */
import { GlobalContextReducers, ITellerService, IUserService } from '@/types/services';
import MockTellerService from './teller/MockTellerService';
import TellerService from './teller/TellerService';


import UserService from './user/UserService';
import MockUserService from './user/MockUserService';

export type GlobalContextType = {
    dataStore: any;
    user?: GlobalUser | undefined;
    loading: boolean;
    loadUserError: boolean;
    getTellerService: () => ITellerService;
    getUserService: () => IUserService;
};

export interface GlobalUserTransaction extends schema.Transaction {
    trackedGoals: number[];
}

export type GlobalUser = {
    id: number;
    nickname: string;
    goals: schema.Goal[];
    connections: schema.Connection[];
    accounts: schema.Account[];
    transactions: GlobalUserTransaction[];
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

    const db = useSQLiteContext();
    const dataStore = drizzle(db, { schema });
    const mocking = Constants?.expoConfig?.extra?.ENABLE_MOCKS || false;

    const [loading, setLoading] = useState<boolean>(true);
    const updateLoadingState = (loading: boolean) => {
        setLoading(loading);
    }

    const [loadUserError, setLoadUserError] = useState<boolean>(false);
    const updateLoadUserError = (error: boolean) => {
        setLoadUserError(error);
    }

    const [user, setUser] = useState<GlobalUser | undefined>();
    const updateUserState = (updatedUser: GlobalUser | undefined) => {
        setUser(updatedUser);
    }

    const reducers: GlobalContextReducers = {
        updateUserState,
        updateLoadUserError,
        updateLoadingState
    };

    let userService: IUserService | undefined;
    const getUserService = (): IUserService => {
        if (userService === undefined) {
            if (mocking) {
                userService = MockUserService(reducers);
            } else {
                userService = UserService(dataStore, reducers);
            }
        }

        return userService;
    }

    let tellerService: ITellerService | undefined;

    const getTellerService = (): ITellerService => {
        if (tellerService === undefined) {
            if (mocking) {
                tellerService = MockTellerService();
            } else {
                tellerService = TellerService(dataStore, user);
            }
        }
        return tellerService;
    }

    return (
        <GlobalContext.Provider
            value={{
                dataStore,
                user,
                loading,
                loadUserError,
                getUserService,
                getTellerService
            }}
        >
            {children}
        </GlobalContext.Provider>
    )

}
