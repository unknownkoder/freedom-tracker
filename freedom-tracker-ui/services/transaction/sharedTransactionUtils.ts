import { Account, Transaction } from "@/db/schema";
import { GlobalUser, GlobalUserTransaction } from "../GlobalContext";
import { GlobalContextReducers } from "@/types/services";
import { generateUTCDateWithOffset, parseDateString } from "../utils";

export const isTransactionThisMonth = (transaction: Transaction): boolean => {
    if (!transaction.date) return false;
    const today = new Date();
    return today.getMonth() === +transaction.date.split('-')[1] - 1;
}

export const getTransactionsForGoals = (goalId: number, user?: GlobalUser): GlobalUserTransaction[] => {
    if (user && user.transactions) {
        return user?.transactions.filter((t) => {
            return t.trackedGoals.some((goal) => goal === goalId);
        })
    }

    return [];
}

export const getAccountObjectForTransaction = (transaction: GlobalUserTransaction, user?: GlobalUser): Account => {
    let account: Account | undefined;

    if (user && user.accounts) {
        account = user.accounts.filter(account => account.id === transaction.accountId)[0];
    }

    if (account) return account;

    throw new Error("Account does not exist on user");

}

export const updateGlobalUsersTransactions = (
    transaction: GlobalUserTransaction,
    updatedTransaction: Transaction,
    globalReducers: GlobalContextReducers,
    user: GlobalUser
) => {
    let updatedUsersTransactions: GlobalUserTransaction[] = (user?.transactions || []).map((t) => {
        if (t.id === updatedTransaction.id) {
            return {
                ...updatedTransaction,
                trackedGoals: transaction.trackedGoals
            }
        }

        return t;
    })
    globalReducers.updateUserState({
        ...user,
        transactions: updatedUsersTransactions
    })
}

export const updateGlobalUsersTransactionGoalList = (
    transaction: GlobalUserTransaction,
    goalList: number[],
    globalReducers: GlobalContextReducers,
    user: GlobalUser
) => {
    const updatedUserTransactions = (user?.transactions || []).map((t) => {
        if (t.id === transaction.id) {
            return {
                ...t,
                trackedGoals: goalList
            }
        }

        return t;
    })

    console.log(goalList);
    globalReducers.updateUserState({
        ...user,
        transactions: updatedUserTransactions
    })
}
