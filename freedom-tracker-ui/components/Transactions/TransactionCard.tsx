import { transactionGoalJunction, transactions } from "@/db/schema";
import { GlobalUser, GlobalUserTransaction, useGlobalContext } from "@/services/GlobalContext"
import { parseDateString } from "@/services/utils";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import Constants from "expo-constants";
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native"

interface TransactionCardProps {
    transaction: GlobalUserTransaction;
    user: GlobalUser;
}

/* TODO UPDATE THE TRANSACTIONCARD FOR MOCKS */

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, user }) => {

    const mocking = Constants?.expoConfig?.extra?.ENABLE_MOCKS || false;

    const { dataStore, updateUserState } = useGlobalContext();

    const account = user.accounts.filter(account => account.id === transaction.accountId)[0];
    let date;
    if (transaction.date) {
        date = new Date(transaction.date);
    }

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [trackTowardsSpending, setTrackTowardsSpending] = useState<boolean>(() => transaction.tracked ?? false);

    const toggleTransactionSettings = () => {
        setIsOpen(open => !open);
    }

    const toggleTrackTowardsSpending = async () => {
        /* Flip the UI switch state */
        setTrackTowardsSpending(tracked => !tracked);
        let updatedTransaction;

        /* If mocking avoid accessing the database */
        if (mocking) {
            updatedTransaction = {
                ...transaction,
                tracked: !trackTowardsSpending
            }
        } else {
            /* Update the record in the database */
            const persistTransaction = await dataStore.update(transactions)
                .set({ tracked: !trackTowardsSpending })
                .where(eq(transactions.id, transaction.id))
                .returning();
            if (persistTransaction.length !== 1) {
                console.log("Something went wrong updating the transaction");
                throw new Error("Update transaction error");
            }
            updatedTransaction = persistTransaction[0];
        }

        console.log("Updated transaction: ", updatedTransaction);
        /* Update the global context record */
        let updatedUsersTransactions: GlobalUserTransaction[] = user.transactions.map((t) => {
            if (t.id === updatedTransaction.id) {
                return {
                    ...updatedTransaction,
                    trackedGoals: transaction.trackedGoals
                }
            }

            return t;
        })
        updateUserState({
            ...user,
            transactions: updatedUsersTransactions
        })
    }

    const trackGoal = async (goalId: number) => {
        let goalList: number[] = JSON.parse(JSON.stringify(transaction.trackedGoals));
        /* Check if the goal already exists in the tracked goals
           If it does we remove, otherwise we add it
        */
        if (transaction.trackedGoals.some(goal => goal === goalId)) {
            console.log("remove the goal");
            if (!mocking) {
                await dataStore.delete(transactionGoalJunction)
                    .where(eq(transactionGoalJunction.goalId, goalId));
            }
            goalList = goalList.filter(g => g !== goalId);
        } else {
            /* Persist the goal transaction junction entry */
            if (!mocking) {
                await dataStore.insert(transactionGoalJunction).values({
                    transactionId: transaction.id,
                    goalId: goalId
                });
            }
            goalList.push(goalId);
        }

        /* Update the GlobalUserTransaction object in global context */
        const updatedUserTransactions = user.transactions.map((t) => {
            if (t.id === transaction.id) {
                return {
                    ...t,
                    trackedGoals: goalList
                }
            }

            return t;
        })
        console.log(updatedUserTransactions[0]);
        updateUserState({
            ...user,
            transactions: updatedUserTransactions
        })
    }

    return (
        <TouchableOpacity onPress={toggleTransactionSettings} style={styles.transactionCard}>
            {/* Content Flex Area */}
            <View style={styles.transactionCardContentFlex}>
                {/* Card Left content */}
                <View style={styles.transactionCardContentContainer}>
                    <Text>${transaction.amount}</Text>
                    <Text>{account.name} {account.lastFour}</Text>
                    <Text>{transaction.counterPartyName} {date ? parseDateString(date) : ''}</Text>
                </View>
                {/* Card Right content */}
                <View style={styles.transactionCardContentIconContainer}>

                </View>
            </View>
            {isOpen &&
                <View style={styles.transactionCardTrackingContentContainer}>
                    <View style={styles.transactionCardTrackingContentMonthlyTrackingContainer}>
                        <Text>Track towards monthly expenses.</Text>
                        <View style={{ width: 50 }}>
                            <Switch
                                trackColor={{ false: 'red', true: 'green' }}
                                thumbColor={'black'}
                                onValueChange={toggleTrackTowardsSpending}
                                value={trackTowardsSpending}
                            />
                        </View>
                    </View>
                    <View style={styles.transactionCardTrackTowardsGoals}>
                        <Text>Track towards goals:</Text>
                        {user.goals.map((goal) => {
                            return (
                                <TouchableOpacity key={goal.id} onPress={(e) => {
                                    e.stopPropagation();
                                    trackGoal(goal.id)
                                }}
                                    style={styles.transactionCardTrackTowardsGoalsGoalCard}
                                >
                                    <Text>{goal.name}</Text>
                                    <View


                                    >
                                        {transaction.trackedGoals.some((goalId) => goalId === goal.id) ?
                                            <Ionicons name="close" size={16} color="#000" />
                                            :
                                            <Ionicons name="add-outline" size={16} color="#000" />
                                        }
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    transactionCard: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4
    },
    transactionCardContentFlex: {

    },
    transactionCardContentContainer: {

    },
    transactionCardContentIconContainer: {

    },
    transactionCardTrackingContentContainer: {

    },
    transactionCardTrackingContentMonthlyTrackingContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 24
    },
    transactionCardTrackTowardsGoals: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 4
    },
    transactionCardTrackTowardsGoalsGoalCard: {
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        borderStyle: 'dashed',
        display: 'flex',
        //flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2
    }
});
