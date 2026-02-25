import { GlobalContextReducers, IUserService } from "@/types/services";
import { GlobalUser, GlobalUserTransaction } from "../GlobalContext";
import { desc } from 'drizzle-orm';
import * as schema from '@/db/schema';

export default function UserService(
    dataStore: any,
    globalReducers: GlobalContextReducers
): IUserService {

    const { updateLoadingState, updateLoadUserError, updateUserState } = globalReducers; 

    const loadUser = async (): Promise<void> => {
        try {
            updateLoadUserError(false);
            updateLoadingState(true);
 
            const appUser = dataStore.query.user.findFirst();
            const connections = dataStore.query.connections.findMany();
            const accounts = dataStore.query.accounts.findMany();
            const goals = dataStore.query.goals.findMany();
            const transactions = dataStore.select()
                .from(schema.transactions)
                .orderBy(desc(schema.transactions.date));
            const transactionsGoalsJunction = dataStore.query
                .transactionGoalJunction.findMany();

            const [
                persistedUser,
                persistedConnections,
                persistedAccounts,
                persistedGoals,
                persistedTransactions,
                persistedTransactionsGoalsJunction
            ]
            = await Promise.all([
                appUser,
                connections,
                accounts,
                goals,
                transactions,
                transactionsGoalsJunction
            ]);

            const globalUserTransactions:GlobalUserTransaction[] = persistedTransactions
                .map((t:schema.Transaction) => {
                    let goals: number[] = [];
                    persistedTransactionsGoalsJunction.forEach((tg:schema.TransactionToGoals) => {
                        if(tg.transactionId === t.id) goals.push(tg.goalId);
                    })
                    
                    return {
                        ...t,
                        trackedGoals: goals
                    }
                }) 

            if (persistedUser) {
                updateUserState({
                    id: persistedUser.id,
                    nickname: persistedUser.nickname,
                    goals: persistedGoals ?? [],
                    connections: persistedConnections ?? [],
                    accounts: persistedAccounts ?? [],
                    transactions: globalUserTransactions ?? []
                });
            } else {
                throw new Error("Unable to load user from database");
            }
        } catch (e) {
            updateLoadUserError(true);
        } finally {
            updateLoadingState(false);
        } 
    }

    const setUser = (user?: GlobalUser) => {
        updateUserState(user);
    }

    return {
        loadUser,
        setUser
    }

}
