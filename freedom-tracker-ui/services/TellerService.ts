import { AccountDetails, AccountDetailsRequest, FetchAndPersistAccountInfoResponse, TellerTransaction } from "@/types/teller";
import { useGlobalContext } from "./GlobalContext";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export default function useTeller() {
    const server = process.env.EXPO_PUBLIC_SERVER_URI;
    const APPEND_TRANSACTIONS = process.env.EXPO_PUBLIC_REFETCH_TRANSACTIONS;
    const { dataStore, user } = useGlobalContext();

    const fetchAccountsByAccessToken = async (accessToken: string) => {
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

    const persistConnection = async (connection: schema.Connection, userId: number) => {
        const persistedConnection = await dataStore.insert(schema.connections)
            .values({ accessToken: connection.accessToken, enrollmentId: connection.enrollmentId, tellerUserId: connection.tellerUserId, userId })
            .returning();
        return persistedConnection[0];
    }

    const persistAccount = async (account: schema.Account, connectionId: number) => {
        const persistedAccount = await dataStore.insert(schema.accounts)
            .values({
                ...account,
                connectionId
            })
            .returning();
        return persistedAccount[0];
    }

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

            allTransactions.sort((a, b) => b.date.localeCompare(a.date));
            return {
                accounts: updatedAccounts,
                transactions: allTransactions
            }
        } catch (e) {
            console.log(e);
            throw new Error();
        }
    }

    return {
        fetchAccountsByAccessToken,
        persistConnection,
        persistAccount,
        fetchAndPersistAccountDetails
    }
}
