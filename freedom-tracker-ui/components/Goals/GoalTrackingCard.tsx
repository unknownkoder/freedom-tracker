import * as schema from "@/db/schema";
import useGoalTrackingCalculator from "@/hooks/useGoalTrackingCalculator";
import { GlobalUserTransaction, useGlobalContext } from "@/services/GlobalContext";
import { generateUTCDateWithOffset, parseDateString } from "@/services/utils";
import { useEffect, useState } from "react";
import { Image, View, Text, StyleSheet } from "react-native";

export interface GoalTrackingCardProps {
    goal: schema.Goal;
    transactions: GlobalUserTransaction[];
}

export const GoalTrackingCard: React.FC<GoalTrackingCardProps> = ({ goal, transactions }) => {

    const amountTracked = useGoalTrackingCalculator(transactions, goal);

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
