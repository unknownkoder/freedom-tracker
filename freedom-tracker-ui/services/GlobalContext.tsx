import Constants from 'expo-constants';

/* DB related imports */
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { use, createContext, type PropsWithChildren, useState } from 'react';
import * as schema from '@/db/schema';

/* Teller service imports */
import { GlobalContextReducers, IGoalService, ITellerService, ITransactionService, IUserService } from '@/types/services';
import MockTellerService from './teller/MockTellerService';
import TellerService from './teller/TellerService';


import UserService from './user/UserService';
import MockUserService from './user/MockUserService';
import GoalService from './goal/GoalService';
import MockGoalService from './goal/MockGoalService';
import TransactionService from './transaction/TransactionService';

export type GlobalContextType = {
    dataStore: any;
    user?: GlobalUser | undefined;
    loading: boolean;
    loadUserError: boolean;
    authState: AuthState;
    setAuthState: (state:AuthState) => void;
    setLoading: (state:boolean) => void;
    getTellerService: () => ITellerService;
    getUserService: () => IUserService;
    getGoalService: () => IGoalService;
    getTransactionService: () => ITransactionService;
};

export interface GlobalUserTransaction extends schema.Transaction {
    trackedGoals: number[];
}

export type GlobalUser = {
    id: number;
    nickname: string;
    goals: schema.Goal[] | undefined;
    connections: schema.Connection[] | undefined;
    accounts: schema.Account[] | undefined;
    transactions: GlobalUserTransaction[] | undefined;
}

export type AuthState = 'LOADING' | 'UNAUTHENTICATED' | 'AUTHENTICATED';

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

    const [user, setUser] = useState<GlobalUser>();
    const updateUserState = (updatedUser: GlobalUser | undefined) => {
        setUser(updatedUser);
    }

    console.log({
        id: user?.id,
        nickname: user?.nickname,
        accounts: user?.accounts?.length,
        transactions: user?.transactions?.length,
        goals: user?.goals?.length,
        connections: user?.connections?.length
    });

    const [authState, setAuthState] = useState<AuthState>('LOADING');
    const updateAuthState = (state:AuthState) => {
        setAuthState(state);
    }
    
    const reducers: GlobalContextReducers = {
        updateUserState,
        updateLoadUserError,
        updateLoadingState,
        updateAuthState
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
                tellerService = MockTellerService(reducers, user);
            } else {
                tellerService = TellerService(dataStore, reducers, user);
            }
        }
        return tellerService;
    }

    let goalService: IGoalService | undefined;
    const getGoalService = (): IGoalService => {
        if(goalService === undefined){
            if(mocking){
                goalService = MockGoalService(reducers, user);
            } else {
                goalService = GoalService(dataStore, reducers, user);
            }
        }
        return goalService;
    }

    let transactionService: ITransactionService | undefined;
    const getTransactionService = ():ITransactionService => {
        if(transactionService === undefined){
            //No need to mock this at this moment
            transactionService = TransactionService(dataStore, reducers, user);
        }

        return transactionService;
    }

    return (
        <GlobalContext.Provider
            value={{
                dataStore,
                user,
                loading,
                loadUserError,
                authState,
                setLoading,
                setAuthState,
                getUserService,
                getTellerService,
                getGoalService,
                getTransactionService
            }}
        >
            {children}
        </GlobalContext.Provider>
    )

}
