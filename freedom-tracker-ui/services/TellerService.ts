import { AccountDetails, AccountDetailsRequest, FetchAndPersistAccountInfoResponse, TellerTransaction } from "@/types/teller";
import { useGlobalContext } from "./GlobalContext";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export default function useTeller() {
    const server = process.env.EXPO_PUBLIC_SERVER_URI;
    const APPEND_TRANSACTIONS = process.env.EXPO_PUBLIC_REFETCH_TRANSACTIONS;
    const { dataStore, updateUserState, user } = useGlobalContext();

    const fetchAccountsByAccessToken = async (accessToken: string) => {
        //console.log(server);
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
        //console.log(persistedConnection[0]);
        return persistedConnection[0];
    }

    const persistAccount = async (account: schema.Account, connectionId: number) => {
        const persistedAccount = await dataStore.insert(schema.accounts)
            .values({
                ...account,
                connectionId
            })
            .returning();
        //console.log(persistedAccount[0]);
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
            //console.log(accountDetails);
            const updateAccounts =
                accountDetails.map((accountInfo) =>
                    dataStore.update(schema.accounts)
                        .set({ balance: accountInfo.balance })
                        .where(eq(schema.accounts.id, accountInfo.accountId))
                        .returning()
                );

            const updatedAccounts = await Promise.all(updateAccounts);

            let transactionsToPersist: schema.Transaction[] = accountDetails.map((account: AccountDetails) => {
                const transactions: schema.Transaction[] = account.transactions.map((transaction: TellerTransaction) => {
                    return {
                        accountId: account.accountId || '',
                        id: transaction.transactionId || '',
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

            //transactionsToPersist.sort((a, b) => b.date.localeCompare(a.date));

            let allTransactions: schema.Transaction[] = [...transactionsToPersist];

            //If we are in the sandbox environment the pagination by transaction id does not work
            //Only persist new transactions to the database if we are not in sandbox and if we included
            //a transaction id to fetch after
            if (APPEND_TRANSACTIONS === 'true' && accounts.some((a) => a.transactionId)) {
                //store any new transactions, and add the users previous transactions behind the new ones
                await dataStore.insert(schema.transactions).values([...transactionsToPersist]);

                if (user) {
                    const currentTransactions = user.transactions;
                    allTransactions = [...allTransactions, ...currentTransactions];
                }
            }

            console.log("Ready to update the user object");
            return {
                accounts: updatedAccounts[0],
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
