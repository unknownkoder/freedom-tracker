import { ActivityIndicator, FlatList, Text, View } from "react-native";
import * as schema from '@/db/schema';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GlobalUserTransaction, useGlobalContext } from "@/services/GlobalContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinkAccountButton } from "@/components/LinkAccountButton";
import { useEffect } from "react";
import useTeller from "@/services/TellerService";
import { AccountDetailsRequest, ConnectAccountCallback, TellerAccountResponse, TellerConnectResponse } from "@/types/teller";
import { SpendingOverview } from "@/components/SpendingOverview";
import Constants from "expo-constants";
import useMockService from "@/services/MockService";
import { GoalTrackingCard } from "@/components/Goals/GoalTrackingCard";
import { TransactionCard } from "@/components/Transactions/TransactionCard";

export default function Index() {

    const mocking = Constants?.expoConfig?.extra?.ENABLE_MOCKS || false;

    const { user, loading, updateUserState, updateLoadingState } = useGlobalContext();
    const { persistConnection, persistAccount, fetchAndPersistAccountDetails } = useTeller();
    const { fetchAndPersistMockAccountDetails, getMockConnection, getMockAccount } = useMockService();

    const router = useRouter();
    const { callback } = useLocalSearchParams();

    const persistNewConnectionAndAccount = async (enrollment: TellerConnectResponse, account: TellerAccountResponse) => {
        updateLoadingState(true);
        if (user) {

            const connection: schema.Connection = {
                id: 0,
                accessToken: enrollment.accessToken,
                enrollmentId: enrollment.enrollment.id,
                tellerUserId: enrollment.user.id,
                userId: user.id
            }
            const persistedConnection = mocking ?
                getMockConnection(account.id)
                :
                await persistConnection(connection, user.id);

            const accountToPersist: schema.Account = {
                id: account.id,
                name: account.name,
                institution: account.institution.name,
                lastFour: account.last_four,
                isPrimary: false,
                status: account.status,
                subtype: account.subtype,
                type: account.type,
                currency: account.currency,
                balance: '0.0',
                connectionId: persistedConnection.id
            }
            const persistedAccount = mocking ?
                getMockAccount(account.id)
                :
                await persistAccount(accountToPersist, persistedConnection.id);

            const accountDetailsRequestBody: AccountDetailsRequest[] = user.accounts.map((account) => {
                const accessToken = user.connections.filter(connection => connection.id === account.connectionId)[0].accessToken;

                let transactionId = '';
                if (user.transactions.length && user.transactions.some((t => t.accountId === account.id))) {
                    const lastAccountTransaction = user.transactions.filter(t => t.accountId === account.id)[0];
                    transactionId = lastAccountTransaction.tellerTransactionId || '';
                }

                const body = transactionId !== '' ?
                    {
                        accountId: account.id,
                        accessToken: accessToken ?? '',
                        transactionId
                    }
                    :
                    {
                        accountId: account.id,
                        accessToken: accessToken ?? ''
                    }

                return body;
            })
            accountDetailsRequestBody.push({
                accountId: persistedAccount.id,
                accessToken: persistedConnection.accessToken
            })

            try {
                const { accounts, transactions } = mocking ?
                    fetchAndPersistMockAccountDetails(accountDetailsRequestBody)
                    :
                    await fetchAndPersistAccountDetails(accountDetailsRequestBody);

                console.log(accounts);

                updateUserState({
                    ...user,
                    accounts: accounts,
                    connections: [...user.connections, persistedConnection],
                    transactions: transactions
                })
                updateLoadingState(false);
            } catch (e) {
                console.log(e);
            }
        }

    }

    useEffect(() => {
        if (callback && user) {
            const callbackData: ConnectAccountCallback = JSON.parse(callback as string);
            persistNewConnectionAndAccount(callbackData.enrollment, callbackData.account);
        }
    }, [])

    const linkNewAccount = () => {
        router.push({
            pathname: "/connect_account",
            params: { redirect: "/(app)" }
        })
    }

    const isTransactionThisMonth = (transaction: schema.Transaction) => {
        if (!transaction.date) return false;
        const today = new Date();
        return today.getMonth() === +transaction.date.split('-')[1] - 1;
    }

    const getTransactionsForGoals = (goalId: number) => {
        return user?.transactions.filter((t) => {
            return t.trackedGoals.some((goal) => goal === goalId);
        }) ?? [];
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <View>
                    {!user ?
                        <ActivityIndicator size="large" />
                        :
                        <View>
                            <Text>Welcome {user.nickname}</Text>
                            {loading ?
                                <ActivityIndicator size="large" />
                                :
                                <View>
                                    <View>
                                        {user && user.accounts.map((account) => {
                                            return (
                                                <View key={account.id}>
                                                    <Text>Bank Account: {account.name} ...{account.lastFour}</Text>
                                                    <Text>{account.balance}</Text>
                                                </View>
                                            )
                                        })}
                                    </View>
                                    <LinkAccountButton onPress={linkNewAccount}>
                                        <Text>Link another account</Text>
                                    </LinkAccountButton>
                                    {user?.transactions.length > 0 &&
                                        <SpendingOverview
                                            transactions={user.transactions.filter(transaction => isTransactionThisMonth(transaction))}
                                        />
                                    }
                                    <View>
                                        <Text>Goals</Text>
                                        <View>
                                            {user?.goals?.length > 0 &&
                                                <FlatList<schema.Goal>
                                                    data={user.goals}
                                                    renderItem={(item) => {
                                                        const today = new Date();
                                                        const endDate = item.item.recurring ?
                                                            null
                                                            :
                                                            item.item.endDate ?? null;
                                                        if(endDate && today > new Date(endDate)){
                                                            return null;
                                                        }
                                                        const goalTransactions = getTransactionsForGoals(item.item.id);
                                                        return (
                                                            <GoalTrackingCard
                                                                goal={item.item}
                                                                transactions={goalTransactions}
                                                            />
                                                        )
                                                    }}
                                                    keyExtractor={(item, index) => String(index)}
                                                ></FlatList>
                                            }
                                        </View>
                                        <Text>Transactions</Text>
                                        {user?.transactions?.length > 0 && <FlatList<GlobalUserTransaction>
                                            data={user.transactions}
                                            renderItem={({ item }) => {
                                                return <TransactionCard transaction={item} user={user}/>
                                            }}
                                            keyExtractor={(item, index) => String(index)}
                                        />}
                                    </View>
                                </View>
                            }
                        </View>
                    }
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
