import * as schema from "@/db/schema";
import { GlobalUserTransaction, useGlobalContext } from "@/services/GlobalContext";
import { generateUTCDateWithOffset, parseDateString } from "@/services/utils";
import { useEffect, useState } from "react";
import { Image, View, Text, StyleSheet } from "react-native";

export interface GoalTrackingCardProps {
    goal: schema.Goal;
    transactions: GlobalUserTransaction[];
}

export const GoalTrackingCard: React.FC<GoalTrackingCardProps> = ({ goal, transactions }) => {

    const [amountTracked, setAmountTracked] = useState<number | undefined>();

    const filterTransactionsForRecurring = (startingDate:Date, endingDate:Date) => {
        return transactions.filter((t) => {
            const transactionDate = generateUTCDateWithOffset(t.date);
            /* Take only the correct date strings to ignore time and them compare */
            if (transactionDate >= startingDate && transactionDate <= endingDate) {
                return t;
            }
        })
    }

    const filterWeeklyGoalTransactions = () => {
        const today = new Date();
        const todaysDayOfWeek = today.getDay();
        let startingDate = generateUTCDateWithOffset(`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`);
        let endingDate = generateUTCDateWithOffset(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`);
        
        //If today is sunday, we just need to update the ending date to saturday
        if (todaysDayOfWeek === 0) {
            endingDate.setDate(endingDate.getDate() + 6)
            endingDate = generateUTCDateWithOffset(parseDateString(endingDate));
        }
        //If today is not sunday, we need to calculate and set starting and ending date
        else {
            let daysToSubtract = todaysDayOfWeek;
            let daysToAdd = 6 - daysToSubtract;
            startingDate.setDate(startingDate.getDate() - daysToSubtract)
            endingDate.setDate(endingDate.getDate() + daysToAdd)
        }

        return filterTransactionsForRecurring(startingDate, endingDate);
    }

    const filterMonthlyGoalTransactions = () => {
        const today = new Date();
        let startingDate = generateUTCDateWithOffset(`${today.getFullYear()}-${today.getMonth() + 1}-1`);
        let endingDate = generateUTCDateWithOffset(`${today.getFullYear()}-${today.getMonth() + 2}-0`);

        return filterTransactionsForRecurring(startingDate, endingDate);
    }

    const filterYearlyGoalTransaction = () => {
        const today = new Date();
        let startingDate = generateUTCDateWithOffset(`${today.getFullYear()}-1-1`);
        let endingDate = generateUTCDateWithOffset(`${today.getFullYear()}-12-31`);

        return filterTransactionsForRecurring(startingDate, endingDate);
    }

    const calculateGoalTotalAmount = () => {
        let transactionsToTrack: schema.Transaction[] = [];
        if (goal.recurring) {
            switch (goal.occuranceType) {
                case 'WEEKLY':
                    transactionsToTrack = filterWeeklyGoalTransactions();
                    console.log("this weeks: ", transactionsToTrack);
                    break;
                case 'MONTHLY':
                    transactionsToTrack = filterMonthlyGoalTransactions();
                    break;
                default:
                    transactionsToTrack = filterYearlyGoalTransaction();
            }
        } else {
            transactionsToTrack = transactions;
        }

        let runningTotal = 0;
        transactionsToTrack.forEach((t) => {
            const amount = Math.abs(Number(t.amount));
            runningTotal += amount;
        })

        setAmountTracked(runningTotal);
    }

    useEffect(() => {
        calculateGoalTotalAmount();
    }, [transactions])

    if (amountTracked === undefined) return null;

    return (
        <View style={styles.goalTrackingCard}>
            {/* Top Area icon / name / goal current / goal amount */}
            <View style={styles.goalTrackingCardInformation}>
                {/* Leading */}
                <Image
                    source={require('../../assets/images/placeholder.png')}
                    style={styles.goalTrackingCardLeadingImage}
                    resizeMode="cover"
                />
                {/* Goal Information */}
                <View style={styles.goalTrackingCardInformationContent}>
                    <Text style={styles.goalTrackingCardName}>{goal.name}</Text>
                    <View style={styles.goalTrackingCardInformationAmounts}>
                        <Text style={[styles.goalTrackingCardAmountText]}>${amountTracked}</Text>
                        <Text style={[styles.goalTrackingCardAmountText]}>${goal.amount}</Text>
                    </View>
                </View>
            </View>
            {/* Tracking Bar */}
            <View style={styles.goalTrackingCardProgressBar}>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    goalTrackingCard: {
        width: '100%',
        padding: 8,
        display: 'flex',
        gap: 12
    },
    goalTrackingCardInformation: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 16
    },
    goalTrackingCardLeadingImage: {
        width: '12%',
        height: '100%',
        borderWidth: 0,
        borderRadius: 8
    },
    goalTrackingCardInformationContent: {
        width: '82%',
        display: 'flex',
    },
    goalTrackingCardName: {
        fontSize: 20,
        lineHeight: 24,
        fontWeight: 600
    },
    goalTrackingCardInformationAmounts: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    goalTrackingCardAmountText: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: 'regular'
    },
    goalTrackingCardProgressBar: {
        width: '100%',
        height: 18,
        borderWidth: 0,
        borderRadius: 9,
        backgroundColor: 'gray'
    }
});
