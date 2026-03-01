import * as schema from "@/db/schema";
import { AccountDetailsRequest, FetchAndPersistAccountInfoResponse, TellerAccountResponse, TellerConnectResponse } from "./teller";
import { AuthState, GlobalUser, GlobalUserTransaction } from "@/services/GlobalContext";
import { GoalSetup } from "./goals";

export interface GlobalContextReducers {
    updateUserState: (user: GlobalUser | undefined) => void;
    updateAuthState: (state: AuthState) => void;
    updateLoadingState: (loading: boolean) => void;
    updateLoadUserError: (error: boolean) => void;
}

/* Service Contracts to be implemented */

export interface IMockDataProvider {
    user: GlobalUser;
    connections: Map<string, schema.Connection[]>;
    accounts: Map<string, schema.Account>;
    enrollmentData: TellerConnectResponse;
    tellerAccounts: Map<string, TellerAccountResponse>;
    transactions: Map<string, schema.Transaction[]>;
    goals: schema.Goal[];
}

export interface IUserService {
    loadUser: () => Promise<void>;
    persistNewUser: (nickname: string) => Promise<void>;
    setUser: (user?: GlobalUser) => void;
}

export interface ITellerService {
    fetchAccountsByAccessToken: (accessToken: string) => Promise<TellerAccountResponse[]>;
    persistConnection: (connection: schema.Connection, userId: number) => Promise<schema.Connection>;
    persistAccount: (account: schema.Account, connectionId: number) => Promise<schema.Account>; 
    fetchAndPersistAccountDetails: (startDate?: string) => Promise<void>;
}

export interface IGoalService {
    persistGoals: (goalsToPersist: GoalSetup[]) => Promise<void>;
}

export interface ITransactionService { 
    updateTransactionTracking: (transaction: GlobalUserTransaction) => Promise<void>;
    trackTransactionTowardsGoal: (transaction: GlobalUserTransaction, goalId:number) => Promise<void>;
}
