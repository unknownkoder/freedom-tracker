import { ActivityIndicator, FlatList, Text, View } from "react-native";
import * as schema from '@/db/schema';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GlobalUserTransaction, useGlobalContext } from "@/services/GlobalContext";
import { useRouter } from "expo-router";
import { LinkAccountButton } from "@/components/LinkAccountButton";
import { SpendingOverview } from "@/components/SpendingOverview";
import { GoalTrackingCard } from "@/components/Goals/GoalTrackingCard";
import { TransactionCard } from "@/components/Transactions/TransactionCard";
import { getTransactionsForGoals, isTransactionThisMonth } from "@/services/transaction/sharedTransactionUtils";

export default function Index() {

    const { user, loading } = useGlobalContext();
    const router = useRouter();

    const linkNewAccount = () => {
        router.push({
            pathname: "/(public)/connect_account",
            params: { redirect: "/(authenticated)" }
        })
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
                                        {(user.accounts || []).map((account) => {
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
                                    {user && user.transactions && user.transactions.length > 0 &&
                                        <SpendingOverview
                                            transactions={user.transactions.filter(transaction => isTransactionThisMonth(transaction))}
                                        />
                                    }
                                    <View>
                                        <Text>Goals</Text>
                                        <View>
                                            {user && user.goals && user.goals.length > 0 &&
                                                <FlatList<schema.Goal>
                                                    data={user.goals}
                                                    renderItem={(item) => {
                                                        const today = new Date();
                                                        const endDate = item.item.recurring ?
                                                            null
                                                            :
                                                            item.item.endDate ?? null;
                                                        if (endDate && today > new Date(endDate)) {
                                                            return null;
                                                        }
                                                        console.log("goalTransactions: ", item.item.id);
                                                        const goalTransactions = getTransactionsForGoals(item.item.id, user);
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
                                        {user && user.transactions && user.transactions.length > 0 && <FlatList<GlobalUserTransaction>
                                            data={user.transactions}
                                            renderItem={({ item }) => {
                                                return <TransactionCard transaction={item} user={user} />
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
