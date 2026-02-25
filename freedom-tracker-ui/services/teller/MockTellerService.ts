import { IMockDataProvider, ITellerService } from "@/types/services";
import { AccountDetailsRequest, FetchAndPersistAccountInfoResponse, TellerAccountResponse } from "@/types/teller";
import * as schema from "@/db/schema";
import MockDataProvider from "../MockDataProvider";

export default function MockTellerService():ITellerService{
    const {accounts, tellerAccounts, connections}:IMockDataProvider = MockDataProvider();

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

    /*
const fetchAndPersistAccountDetails = async (accounts: AccountDetailsRequest[]): Promise<FetchAndPersistAccountInfoResponse> => {
        try {
            const res = await fetch(`http://${server}:8000/api/accounts/details`, {
                method: 'POST',
                body: JSON.stringify(accounts),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const accountDetails: AccountDetails[] = await res.json();
            //We need to update the database and set the global context
            const updateAccounts =
                accountDetails.map((accountInfo) =>
                    dataStore.update(schema.accounts)
                        .set({ balance: accountInfo.balance })
                        .where(eq(schema.accounts.id, accountInfo.accountId))
                        .returning()
                );

            const persistedAccountArrays = await Promise.all(updateAccounts);
            const updatedAccounts: schema.Account[] = [];
            persistedAccountArrays.forEach((account) => updatedAccounts.push(account[0]));

            let transactionsToPersist = accountDetails.map((account: AccountDetails) => {
                const transactions = account.transactions.map((transaction: TellerTransaction) => {
                    return {
                        accountId: account.accountId || '',
                        tellerTransactionId: transaction.transactionId || '',
                        amount: `${transaction.amount}`,
                        date: transaction.date || '',
                        category: transaction.category || null,
                        counterPartyName: transaction.counterParty.name,
                        counterPartyType: transaction.counterParty.type,
                        type: transaction.type || '',
                        tracked: true
                    }
                })

                return {
                    transactions
                }
            }).flatMap(accountTransactions => accountTransactions.transactions);

            let allTransactions: schema.Transaction[] = [];

            //If we are in the sandbox environment the pagination by transaction id does not work
            //Only persist new transactions to the database if we are not in sandbox and if we included
            //a transaction id to fetch after
            if (APPEND_TRANSACTIONS) {
                const persistedTransactions = await dataStore.insert(schema.transactions).values([...transactionsToPersist]).returning();

                if (user) {
                    const currentTransactions = user.transactions;
                    allTransactions = [...persistedTransactions, ...currentTransactions];
                }
            } else {
                if(user){
                    allTransactions = user.transactions;
                }
            }

            const trackedGoals = await dataStore.select().from(schema.transactionGoalJunction);
            console.log(trackedGoals);

            allTransactions.sort((a, b) => b.date.localeCompare(a.date));

            const globalUserTransactions: GlobalUserTransaction[] = allTransactions.map((t) => {
                return {
                    ...t,
                    trackedGoals: []
                }
            })

            return {
                accounts: updatedAccounts,
                transactions: globalUserTransactions
            }
        } catch (e) {
            console.log(e);
            throw new Error();
        }
    }

    */
    const fetchAndPersistAccountDetails = async (
        accountDetailsRequest: AccountDetailsRequest[]
    ): Promise<FetchAndPersistAccountInfoResponse> => {
        /*
        export type AccountDetailsRequest = {
            accountId: string;
            accessToken: string;
            transactionId?: string;
        }
        */
        const fetchedAccounts:schema.Account[] = accountDetailsRequest.map((a) => {
            return accounts.get(a.accountId);
        });

       console.log(fetchedAccounts); 

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
