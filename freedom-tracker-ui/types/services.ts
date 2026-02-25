import * as schema from "@/db/schema";
import { AccountDetailsRequest, FetchAndPersistAccountInfoResponse, TellerAccountResponse, TellerConnectResponse } from "./teller";
import { GlobalUser } from "@/services/GlobalContext";

export interface GlobalContextReducers {
    updateUserState: (user: GlobalUser | undefined) => void;
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
    setUser: (user?:GlobalUser) => void;
}

export interface ITellerService {
    fetchAccountsByAccessToken: (accessToken: string) => Promise<TellerAccountResponse[]>;
    persistConnection: (connection: schema.Connection, userId: number) => Promise<schema.Connection>;
    persistAccount: (account: schema.Account, connectionId: number) => Promise<schema.Account>;
    fetchAndPersistAccountDetails: (accounts: AccountDetailsRequest[]) => Promise<FetchAndPersistAccountInfoResponse>;
}
