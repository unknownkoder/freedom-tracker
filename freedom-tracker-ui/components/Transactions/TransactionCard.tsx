import { transactionGoalJunction, transactions } from "@/db/schema";
import { GlobalUser, GlobalUserTransaction, useGlobalContext } from "@/services/GlobalContext"
import { parseDateString } from "@/services/utils";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import Constants from "expo-constants";
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native"
import * as schema from '@/db/schema';
import { getAccountObjectForTransaction } from "@/services/transaction/sharedTransactionUtils";

interface TransactionCardProps {
    transaction: GlobalUserTransaction;
    user: GlobalUser;
}

/* TODO UPDATE THE TRANSACTIONCARD FOR MOCKS */

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, user }) => {


    const { getTransactionService } = useGlobalContext();

    const {updateTransactionTracking, trackTransactionTowardsGoal} = getTransactionService(); 

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [trackTowardsSpending, setTrackTowardsSpending] = useState<boolean>(() => transaction.tracked ?? false);
    const [account, setAccount] = useState<schema.Account>(() => getAccountObjectForTransaction(transaction, user));

    const toggleTransactionSettings = () => {
        setIsOpen(open => !open);
    }

    const toggleTrackTowardsSpending = async () => {
        console.log("~~ Start tracing for toggleTrackTowardsSpending ~~")
        /* Flip the UI switch state */
        setTrackTowardsSpending(tracked => !tracked);
        await updateTransactionTracking(transaction); 
    }

    const trackGoal = async (goalId: number) => {
        await trackTransactionTowardsGoal(transaction, goalId);
    }

    return (
        <TouchableOpacity onPress={toggleTransactionSettings} style={styles.transactionCard}>
            {/* Content Flex Area */}
            <View style={styles.transactionCardContentFlex}>
                {/* Card Left content */}
                <View style={styles.transactionCardContentContainer}>
                    <Text>${transaction.amount}</Text>
                    <Text>{account.name} {account.lastFour}</Text>
                    <Text>{transaction.counterPartyName} {transaction.date ? parseDateString(transaction.date) : ''}</Text>
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
                        {(user?.goals || []).map((goal) => {
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
