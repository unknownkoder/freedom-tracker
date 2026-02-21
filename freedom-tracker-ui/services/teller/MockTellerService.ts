import { IMockDataProvider, ITellerService } from "@/types/services";
import { AccountDetailsRequest, FetchAndPersistAccountInfoResponse, TellerAccountResponse } from "@/types/teller";
import * as schema from "@/db/schema";
import MockDataProvider from "../MockDataProvider";

export default function MockTellerService():ITellerService{
    const {tellerAccounts, connections}:IMockDataProvider = MockDataProvider();

    const fetchAccountsByAccessToken = async (accessToken: string): Promise<TellerAccountResponse[]> => {
                
        //Get the connection via the accessToken
        const accountConnectionsByAccessToken = connections.get(accessToken) ?? [];

        //Get the account based on that connection => enrollment id
        const accountsByEnrollment:TellerAccountResponse[] = [];
        accountConnectionsByAccessToken.forEach((connection) => {
            const enrollmentId = `${connection.enrollmentId}`;
            const account = tellerAccounts.get(enrollmentId);
            if(account) accountsByEnrollment.push(account);
        })
        const ret = await Promise.resolve([...accountsByEnrollment]).then(data => data);

        return ret;
    }
    const persistConnection = async (connection: schema.Connection, userId: number):Promise<schema.Connection> =>  {
        const ret = await Promise.resolve({
            id: 1,
            accessToken: '',
            enrollmentId: '',
            tellerUserId: '',
            userId: 1
        }).then(data => data);

        return ret; 
    }
    const persistAccount = async (account: schema.Account, connectionId: number): Promise<schema.Account> => {
        const ret = await Promise.resolve({
            id: '',
            institution: '',
            lastFour: '',
            name: '',
            isPrimary: true,
            status: '',
            subtype: '',
            type: '',
            currency: 'USD',
            balance: '0.0',
            connectionId: 1
        }).then(data => data);

        return ret;
    }
    const fetchAndPersistAccountDetails = async (accounts: AccountDetailsRequest[]): Promise<FetchAndPersistAccountInfoResponse> => {
        const ret = await Promise.resolve({
            accounts: [],
            transactions: []
        }).then(data => data);

        return ret;
    }

    return {
        fetchAccountsByAccessToken,
        persistConnection,
        persistAccount,
        fetchAndPersistAccountDetails
    }
}
