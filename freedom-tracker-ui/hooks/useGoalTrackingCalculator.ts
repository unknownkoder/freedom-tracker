import { Goal, Transaction } from "@/db/schema";
import { GlobalUserTransaction } from "@/services/GlobalContext";
import { generateUTCDateWithOffset, parseDateString } from "@/services/utils";
import { useMemo } from "react";

export default function useGoalTrackingCalculator(transactions:GlobalUserTransaction[], goal:Goal):number | undefined{

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
        let transactionsToTrack: Transaction[] = [];
        if (goal.recurring) {
            switch (goal.occuranceType) {
                case 'WEEKLY':
                    transactionsToTrack = filterWeeklyGoalTransactions();
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

        return runningTotal;
    } 

    const amountTracked = useMemo(() => {
        return calculateGoalTotalAmount();       
    }, [transactions, transactions.length])

    return amountTracked;
}
