import { GlobalContextReducers, ITransactionService } from "@/types/services";
import { GlobalUser, GlobalUserTransaction } from "../GlobalContext";

import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateGlobalUsersTransactionGoalList, updateGlobalUsersTransactions } from "./sharedTransactionUtils";

export default function TransactionService(dataStore: any, globalReducers: GlobalContextReducers, user?: GlobalUser): ITransactionService { 

    const updateTransactionTracking = async (transaction: GlobalUserTransaction): Promise<void> => {
        if (user) {
            let updatedTransaction;
            const persistTransaction = await dataStore.update(schema.transactions)
                .set({ tracked: !transaction.tracked })
                .where(eq(schema.transactions.id, transaction.id))
                .returning();
            if (persistTransaction.length !== 1) {
                console.log("Something went wrong updating the transaction");
                throw new Error("Update transaction error");
            }
            updatedTransaction = persistTransaction[0];
            updateGlobalUsersTransactions(
                transaction,
                updatedTransaction,
                globalReducers,
                user
            ); 
        }
    }

    const trackTransactionTowardsGoal = async (transaction: GlobalUserTransaction, goalId: number): Promise<void> => {
        if (user) {
            let goalList: number[] = JSON.parse(JSON.stringify(transaction.trackedGoals));
            /* Check if the goal already exists in the tracked goals
               If it does we remove, otherwise we add it
            */
            if (transaction.trackedGoals.some(goal => goal === goalId)) {
                await dataStore.delete(schema.transactionGoalJunction)
                    .where(eq(schema.transactionGoalJunction.goalId, goalId));
                goalList = goalList.filter(g => g !== goalId);
            } else {
                /* Persist the goal transaction junction entry */
                await dataStore.insert(schema.transactionGoalJunction).values({
                    transactionId: transaction.id,
                    goalId: goalId
                });
                goalList.push(goalId);
            }

            updateGlobalUsersTransactionGoalList(
                transaction,
                goalList,
                globalReducers,
                user
            );
        }
    }

    return { 
        updateTransactionTracking,
        trackTransactionTowardsGoal
    }

}
