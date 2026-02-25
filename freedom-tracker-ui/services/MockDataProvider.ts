import mockUser from "../assets/mocks/user.json";
import mockAccounts from "../assets/mocks/accounts.json";
import mockConnections from "../assets/mocks/connections.json";
import mockAccount1Transactions from "../assets/mocks/transactions_mock_acc_1.json";
import mockEnrollmentData from "../assets/mocks/enrollments.json";
import mockTellerAccounts from "../assets/mocks/teller_accounts.json";
import mockAccount2Transactions from "../assets/mocks/transactions_mock_acc_2.json";
import mockAccount3Transactions from "../assets/mocks/transactions_mock_acc_3.json";
import mockGoals from "../assets/mocks/goals.json";

import * as schema from '../db/schema';
import { GlobalUser } from "./GlobalContext";
import { TellerAccountResponse, TellerConnectResponse } from "@/types/teller";
import { IMockDataProvider } from "@/types/services";

export default function MockDataProvider():IMockDataProvider{
    const user:GlobalUser = mockUser.user;
    
    const unMappedConnections:schema.Connection[] = mockConnections.connections as schema.Connection[];
    const connections:Map<string, schema.Connection[]> = new Map();
    unMappedConnections.forEach((connection) => {
        const accessToken = `${connection.accessToken}`;
        const connectionArr = connections.get(accessToken);
        if(connectionArr){
            connectionArr.push(connection);
            connections.set(accessToken, connectionArr);
        } else {
            connections.set(accessToken, [connection]);     
        } 
    })

    const unMappedAccounts:schema.Account[] = mockAccounts.accounts as schema.Account[];
    const accounts:Map<string, schema.Account> = new Map();
    unMappedAccounts.forEach((account, index) => {
        accounts.set(`mock_acc_${index+1}`, account);
    })

    const enrollmentData:TellerConnectResponse = mockEnrollmentData.enrollment_data;

    const tellerAccounts:Map<string, TellerAccountResponse> = new Map();
    const unMappedTellerAccounts:TellerAccountResponse[] = mockTellerAccounts.accounts as TellerAccountResponse[];
    unMappedTellerAccounts.forEach((account) => {
        const enrollmentId = `${account.enrollmentId}`;
        tellerAccounts.set(enrollmentId, account);
    })

    const mock_acc_1_transactions = mockAccount1Transactions.transactions.map((transaction) => {
        const today = new Date();
        const date = transaction.date.replace('{0.month}', `${today.getMonth() + 1}`);
        return {
            ...transaction,
            date
        }
    }) as schema.Transaction[];
    
    const mock_acc_2_transactions = mockAccount2Transactions.transactions.map((transaction) => {
        const today = new Date();
        const date = transaction.date.replace('{0.month}', `${today.getMonth() + 1}`);
        return {
            ...transaction,
            date
        }
    }) as schema.Transaction[];

    const mock_acc_3_transactions = mockAccount3Transactions.transactions.map((transaction) => {
        const today = new Date();
        const date = transaction.date.replace('{0.month}', `${today.getMonth() + 1}`);
        return {
            ...transaction,
            date
        }
    }) as schema.Transaction[];

    const transactions = new Map<string, schema.Transaction[]>();
    transactions.set('mock_acc_1', mock_acc_1_transactions);
    transactions.set('mock_acc_2', mock_acc_2_transactions);
    transactions.set('mock_acc_3', mock_acc_3_transactions);

    const goals:schema.Goal[] = mockGoals.goals as schema.Goal[];

    const dateMappedGoals = goals.map((goal) => {
        const today = new Date();
        return {
            ...goal,
            startDate: today.toISOString()
        }
    }) as schema.Goal[];

    return {
        user,
        connections,
        accounts,
        enrollmentData,
        tellerAccounts,
        transactions,
        goals: dateMappedGoals
    }
}
