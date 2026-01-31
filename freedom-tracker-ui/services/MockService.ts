import mockUser from "../assets/mocks/user.json";
import mockAccounts from "../assets/mocks/accounts.json";
import mockConnections from "../assets/mocks/connections.json";
import mockAccount1Transactions from "../assets/mocks/transactions_mock_acc_1.json";
import mockEnrollmentData from "../assets/mocks/enrollments.json";
import mockTellerAccounts from "../assets/mocks/teller_accounts.json";
import mockAccount2Transactions from "../assets/mocks/transactions_mock_acc_2.json";
import mockAccount3Transactions from "../assets/mocks/transactions_mock_acc_3.json";
import { GlobalUser } from "./GlobalContext";
import * as schema from '../db/schema';
import { AccountDetailsRequest, FetchAndPersistAccountInfoResponse, TellerAccountResponse, TellerConnectResponse } from "@/types/teller";

export default function useMockService() {

    const user = mockUser.user;
    const connections = mockConnections.connections;
    const accounts = mockAccounts.accounts;
    const enrollmentData = mockEnrollmentData.enrollment_data;
    const tellerAccounts = mockTellerAccounts.accounts;

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

    const transactionsMap = new Map<string, schema.Transaction[]>();
    transactionsMap.set('mock_acc_1', mock_acc_1_transactions);
    transactionsMap.set('mock_acc_2', mock_acc_2_transactions);
    transactionsMap.set('mock_acc_3', mock_acc_3_transactions);

    const fetchMockUser = (): GlobalUser => {
        const transactions = mock_acc_1_transactions;
        transactions.sort((a, b) => b.date.localeCompare(a.date));

        return {
            id: user.id,
            nickname: user.nickname,
            goals: [],
            connections: [connections.mock_acc_1],
            accounts: [accounts.mock_acc_1],
            transactions: [...transactions]
        }
    }

    const fetchAndPersistMockAccountDetails = (accountDetailsRequest: AccountDetailsRequest[]): FetchAndPersistAccountInfoResponse => {
        const mockedAccounts = accountDetailsRequest.map((account) => {
            return accounts[account.accountId];
        })

        const mockedTransactions: schema.Transaction[] = [];

        accountDetailsRequest.forEach((account) => {
            const accountTransactions: schema.Transaction[] = transactionsMap.get(account.accountId) as schema.Transaction[];
            mockedTransactions.push(...accountTransactions);
        })

        mockedTransactions.sort((a, b) => b.date.localeCompare(a.date));
        return {
            accounts: mockedAccounts,
            transactions: mockedTransactions
        };
    }

    const getMockTellerConnectResponse = () => {
        return enrollmentData as TellerConnectResponse;
    }

    const getMockTellerAccounts = () => {
        return tellerAccounts as TellerAccountResponse[];
    }

    const getMockConnection = (key:string) => {
        console.log("connection key", key);
        return connections[key] as schema.Connection;
    }

    const getMockAccount = (key:string) => {
        return accounts[key] as schema.Account;
    }

    return {
        fetchMockUser,
        fetchAndPersistMockAccountDetails,
        getMockTellerConnectResponse,
        getMockTellerAccounts,
        getMockConnection,
        getMockAccount
    }

}
