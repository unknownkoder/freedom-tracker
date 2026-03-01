import { GlobalContextReducers, ITransactionService } from "@/types/services";
import { GlobalUser, GlobalUserTransaction } from "../GlobalContext";
import { Transaction, Account } from "@/db/schema";
import { updateGlobalUsersTransactionGoalList, updateGlobalUsersTransactions } from "./sharedTransactionUtils";

export default function MockTransactionService(globalReducers: GlobalContextReducers, user?: GlobalUser): ITransactionService {

    const updateTransactionTracking = async (transaction: GlobalUserTransaction): Promise<void> => {
        if (user) {
            let updatedTransaction;
            updatedTransaction = {
                ...transaction,
                tracked: !transaction.tracked
            }

            updateGlobalUsersTransactions(
                transaction,
                updatedTransaction,
                globalReducers,
                user
            )
        }

    }

    const trackTransactionTowardsGoal = async (transaction: GlobalUserTransaction, goalId: number): Promise<void> => {
        if (user) {
            let goalList: number[] = JSON.parse(JSON.stringify(transaction.trackedGoals));
            if (transaction.trackedGoals.some(goal => goal === goalId)) { 
                goalList = goalList.filter(g => g !== goalId);
            } else { 
                goalList.push(goalId);
            }

            updateGlobalUsersTransactionGoalList(
                transaction,
                goalList,
                globalReducers,
                user
            ) 
        }
    }

    return { 
        updateTransactionTracking,
        trackTransactionTowardsGoal
    }

}
