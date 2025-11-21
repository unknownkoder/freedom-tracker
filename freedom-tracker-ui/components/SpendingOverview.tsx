import {View, Text, StyleSheet} from 'react-native';
import * as schema from '@/db/schema';
import {useEffect, useState} from 'react';

interface SpendingOverviewProps {
    transactions: schema.Transaction[]
}

export const SpendingOverview: React.FC<SpendingOverviewProps> = ({transactions}) => {

    const [income, setIncome] = useState<number>(-1);
    const [spending, setSpending] = useState<number>(-1);
    const [percentage, setPercentage] = useState<number>(-1);

    const calculateIncomeAndSpending = () => {
        let runningIncome = 0;
        let runningSpending = 0;
        let percentSpent = 0;

        transactions.forEach((transaction) => {
            const amount = transaction.amount ? Number(transaction.amount) : 0;

            if(amount > 0){
                runningIncome += amount;
            }

            if(amount < 0){
                runningSpending = Math.abs(amount);
            }
        })

        if(runningIncome > 0 && runningSpending > 0){
            let percent = runningSpending / runningIncome;

            percentSpent = Math.round((percent * 100) * 100) / 100;
        }

        setIncome(runningIncome);
        setSpending(runningSpending);
        setPercentage(percentSpent);
    }

    useEffect(() => {
        calculateIncomeAndSpending();
    }, [])

    return (
        <View style={styles.container}>
            {income > 0 && spending > 0 &&
                <View style={styles.overview}>
                    <Text style={styles.overviewTitle}>Your month to date spending:</Text>
                    <View style={styles.overviewStats}>
                        <Text style={[styles.overviewStatIncome, styles.overviewStatText]}>
                            ${income.toFixed(2)}
                        </Text>
                        <Text style={[styles.overviewStatText, styles.overviewStatSpending]}>
                            ${spending.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.overviewProgressBar}>
                        <View style={{
                            width: percentage > 100 ? '0%' : `${100 - percentage}%`,
                            backgroundColor: 'green'
                        }}></View>
                        <View style={{
                            width: percentage > 100 ? '100%' : `${percentage}%`,
                            backgroundColor: 'red'
                        }}></View>
                    </View>
                    <Text style={styles.overviewSubtitle}>You have spent {percentage}% of your income this month</Text>
                </View>
            }
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 8,
        marginBottom: 80
    },
    overview: {
        flex: 1,
        gap: 4,
        width: '100%',
        paddingHorizontal: 8
    },
    overviewTitle: {
        fontSize: 24,
        fontWeight: 800,
        paddingBottom: 4
    },
    overviewStats: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    overviewStatText: {
        fontSize: 20,
        fontWeight: 800,
    },
    overviewStatIncome: {
        color: 'green'
    },
    overviewStatSpending: {
        color: 'red'
    },
    overviewProgressBar: {
        width: '100%',
        height: 32,
        display: 'flex',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 4
    },
    overviewSubtitle: {
        fontSize: 16,
        fontWeight: 600
    }
})
