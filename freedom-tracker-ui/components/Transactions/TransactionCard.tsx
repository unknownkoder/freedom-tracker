import { GlobalUser, GlobalUserTransaction } from "@/services/GlobalContext"
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native"

interface TransactionCardProps {
    transaction: GlobalUserTransaction;
    user: GlobalUser;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, user }) => {

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

    const toggleTrackTowardsSpending = () => {
        /* Other logic to update tracked in db */
        setTrackTowardsSpending(tracked => !tracked);
    }

    const trackGoal = (goalId:number) => {
        /* Persist the goal transaction junction entry */
        /* Update the GlobalUserTransaction object in global context */
    }

    return (
        <TouchableOpacity onPress={toggleTransactionSettings} style={styles.transactionCard}>
            {/* Content Flex Area */}
            <View style={styles.transactionCardContentFlex}>
                {/* Card Left content */}
                <View style={styles.transactionCardContentContainer}>
                    <Text>${transaction.amount}</Text>
                    <Text>{account.name} {account.lastFour}</Text>
                    <Text>{transaction.counterPartyName} {date ? date.toLocaleDateString() : ''}</Text>
                </View>
                {/* Card Right content */}
                <View style={styles.transactionCardContentIconContainer}>

                </View>
            </View>
            {isOpen &&
                <View style={styles.transactionCardTrackingContentContainer}>
                    <View>
                        <Switch
                            trackColor={{ false: 'gray', true: 'white' }}
                            thumbColor={'black'}
                            onValueChange={toggleTrackTowardsSpending}
                            value={trackTowardsSpending}
                        />
                        <Text>Track towards monthly expenses.</Text>
                    </View>
                    <View>
                        <Text>Track towards goals:</Text>
                        <View>
                            {user.goals.map((goal) => {
                                return (
                                    <TouchableOpacity key={goal.id} onPress={(e) => {
                                                e.stopPropagation();
                                                trackGoal(goal.id)
                                            }}>
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
                </View>
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    transactionCard: {

    },
    transactionCardContentFlex: {

    },
    transactionCardContentContainer: {

    },
    transactionCardContentIconContainer: {

    },
    transactionCardTrackingContentContainer: {

    }
});
