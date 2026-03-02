import { GlobalContextReducers, IMockDataProvider, ITellerService } from "@/types/services";
import { AccountDetailsRequest, TellerAccountResponse, TellerConnectResponse } from "@/types/teller";
import * as schema from "@/db/schema";
import MockDataProvider from "../MockDataProvider";
import { GlobalUser, GlobalUserTransaction } from "../GlobalContext";
import { mapAccountDetailsRequestBody } from "../utils";

export default function MockTellerService(globalReducers: GlobalContextReducers, user?: GlobalUser): ITellerService {
    const {
        accounts: mockAccounts,
        transactions: mockTransactions,
        tellerAccounts: mockTellerAccounts,
        connections: mockConnections,
        enrollmentData: mockEnrollmentData
    }: IMockDataProvider = MockDataProvider();

    const fetchAccountsByAccessToken = async (accessToken: string): Promise<TellerAccountResponse[]> => {
        //Get the connection via the accessToken
        const accountConnectionsByAccessToken = mockConnections.get(accessToken) ?? [];

        //Get the account based on that connection => enrollment id
        const accountsByEnrollment: TellerAccountResponse[] = [];
        accountConnectionsByAccessToken.forEach((connection) => {
            const enrollmentId = `${connection.enrollmentId}`;
            const account = mockTellerAccounts.get(enrollmentId);
            if (account) accountsByEnrollment.push(account);
        })
        const ret = await Promise.resolve([...accountsByEnrollment]).then(data => data);

        return ret;
    }
    const persistConnection = async (connection: schema.Connection, userId: number): Promise<schema.Connection> => {
        console.log("mock persist Connection:", connection);
        console.log("mock persistConnection mockConnections:", mockConnections);
        const connections = mockConnections.get(connection.accessToken as string);
        if (!connections) {
            const ret = await Promise.reject(new Error("Connections with accessToken do not exist"));
            return ret;
        }
        console.log("mock persistConnection connections: ", connections);

        const persistedConnection = connections.filter(c => c.enrollmentId === connection.enrollmentId)[0];
        if (!persistConnection) {
            const ret = await Promise.reject(new Error("Connection with enrollmentId does not exist"));
            return ret;
        }

        console.log(persistedConnection);

        const ret = await Promise.resolve(persistedConnection).then(data => data);

        return ret;
    }
    const persistAccount = async (account: schema.Account, connectionId: number): Promise<schema.Account> => {
        console.log("mock persist account:", account);

        const ret = await Promise.resolve({
            ...account,
            connectionId
        }).then(data => data);

        return ret;
    }

    const fetchAndPersistAccountDetails = async (startDate?: string): Promise<void> => {
        if (user) {
            try {
                globalReducers.updateLoadingState(true);
                const accounts: AccountDetailsRequest[] = mapAccountDetailsRequestBody(user, startDate)

                const updatedAccounts: schema.Account[] =
                    accounts.map((accountInfo) => {
                        return mockAccounts.get(accountInfo.accountId) as schema.Account;
                    });

                const transactions: schema.Transaction[] = [];
                accounts.forEach((acc) => {
                    const accountTransactions = mockTransactions.get(acc.accountId) as schema.Transaction[];
                    transactions.push(...accountTransactions);
                })

                transactions.sort((a, b) => b.date.localeCompare(a.date));


                const globalUserTransactions: GlobalUserTransaction[] = transactions.map((t) => {
                    return {
                        ...t,
                        trackedGoals: []
                    }
                })

                globalReducers.updateUserState({
                    ...user,
                    accounts: updatedAccounts,
                    transactions: globalUserTransactions
                })
            } catch (e) {
                console.log(e);
            } finally {
                globalReducers.updateLoadingState(false);
            }
        }
    }

    const getDefaultEnrollmentData = (): TellerConnectResponse | undefined => {
        return mockEnrollmentData;
    }

    const mapEnrollmentDataForCallback = (enrollment: TellerConnectResponse, account: TellerAccountResponse): TellerConnectResponse => {
        let mockedEnrollment = JSON.parse(JSON.stringify(enrollment));
        mockedEnrollment.enrollment = {
                id: account.enrollmentId,
                institution: {
                    id: account.institution.id,
                    name: account.institution.name
                }
            }
        return mockedEnrollment;
    }

    return {
        fetchAccountsByAccessToken,
        persistConnection,
        persistAccount,
        fetchAndPersistAccountDetails,
        getDefaultEnrollmentData,
        mapEnrollmentDataForCallback
    }
}
