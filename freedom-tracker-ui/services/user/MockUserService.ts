import { GlobalContextReducers, IMockDataProvider, IUserService } from "@/types/services";
import { GlobalUser, GlobalUserTransaction } from "../GlobalContext";
import MockDataProvider from "../MockDataProvider";
import * as schema from '@/db/schema';

export default function MockUserService(reducers:GlobalContextReducers):IUserService{

    const {user, goals, connections:connectionMap, accounts:accountMap, transactions:transationMap}:IMockDataProvider = MockDataProvider(); 
    const { updateUserState, updateLoadingState } = reducers;

    const loadUser = async (): Promise<void> => {
        console.log("~~~ In the new mock user service ~~~")
        const connections:schema.Connection[] = [];
        const connection = connectionMap.get('access_token_1');
        if(connection) connections.push(...connection);
        console.log("~~~ Connections for user ~~~");
        console.log(connections);
        const accounts:schema.Account[] = [];
        const account = accountMap.get("mock_acc_1");
        if(account) accounts.push(account);
        console.log("~~~ Account for user ~~~");
        console.log(accounts);
        const transactions:GlobalUserTransaction[] = [];
        const accountOneTransactions = transationMap.get('mock_acc_1');
        if(accountOneTransactions){
            accountOneTransactions.sort((a, b) => b.date.localeCompare(a.date));
            accountOneTransactions.forEach((t) => {
                transactions.push({
                    ...t,
                    trackedGoals: []
                })
            }) 
        }
        console.log("~~~ Transactions for user ~~~");
        console.log(transactions.length);
        updateUserState({
            id: user.id,
            nickname: user.nickname,
            goals: [...goals],
            connections,
            accounts,
            transactions

        })
        updateLoadingState(false);
        Promise.resolve();
    }

    const setUser = (user?:GlobalUser) => {
       updateUserState(user); 
    }

    return {
        loadUser, 
        setUser
    }

}
