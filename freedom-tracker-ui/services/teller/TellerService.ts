import { AccountDetails, AccountDetailsRequest, TellerAccountResponse, TellerConnectResponse, TellerTransaction } from "@/types/teller";

import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { GlobalUser, GlobalUserTransaction } from "../GlobalContext";
import { GlobalContextReducers, ITellerService } from "@/types/services";
import { mapAccountDetailsRequestBody } from "../utils";

export default function TellerService(dataStore: any, globalReducers: GlobalContextReducers, user?: GlobalUser): ITellerService {
    const server = process.env.EXPO_PUBLIC_SERVER_URI;

    const fetchAccountsByAccessToken = async (accessToken: string): Promise<TellerAccountResponse[]> => {
        const res = await fetch(`http://${server}:8000/api/accounts`, {
            method: 'GET',
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        return data;
    }

    const persistConnection = async (connection: schema.Connection, userId: number): Promise<schema.Connection> => {
        const persistedConnection = await dataStore.insert(schema.connections)
            .values({ accessToken: connection.accessToken, enrollmentId: connection.enrollmentId, tellerUserId: connection.tellerUserId, userId })
            .returning();
        return persistedConnection[0];
    }

    const persistAccount = async (account: schema.Account, connectionId: number): Promise<schema.Account> => {
        const persistedAccount = await dataStore.insert(schema.accounts)
            .values({
                ...account,
                connectionId
            })
            .onConflictDoNothing({ target: schema.accounts.id })
            .returning();
        return persistedAccount[0];
    } 

    //Refactor so that this takes in the user from global context
    //Make a util function that maps the user to the AccountDetailsRequest object
    //Fetch the data like normal
    const fetchAndPersistAccountDetails = async (startDate?: string): Promise<void> => {
        if (user) {
            try {
                globalReducers.updateLoadingState(true);
                const accounts: AccountDetailsRequest[] = mapAccountDetailsRequestBody(user, startDate)
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

                const newTransactions = accountDetails.map((account: AccountDetails) => {
                    const transactions = account.transactions
                        .map((transaction: TellerTransaction) => {
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

                const currentTransactions = user?.transactions ?? [];
                const persistedTransactions = await dataStore
                    .insert(schema.transactions)
                    .values([...newTransactions])
                    .onConflictDoNothing({ target: schema.transactions.tellerTransactionId })
                    .returning();

                const allTransactions = [...persistedTransactions, ...currentTransactions];

                allTransactions.sort((a, b) => b.date.localeCompare(a.date));

                console.log("allTransactions: ", allTransactions.length);

                const globalUserTransactions: GlobalUserTransaction[] = allTransactions.map((t) => {
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

    return {
        fetchAccountsByAccessToken,
        persistConnection,
        persistAccount,
        fetchAndPersistAccountDetails
    }
}
