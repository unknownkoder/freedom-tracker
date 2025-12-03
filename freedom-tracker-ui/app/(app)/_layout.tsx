import { useGlobalContext } from "@/services/GlobalContext";
import useTeller from "@/services/TellerService";
import { AccountDetailsRequest } from "@/types/teller";
import { Stack } from "expo-router"
import { useEffect } from "react"
import Constants from "expo-constants";
import useMockService from "@/services/MockService";

export default function RootLayout() {

    const mocking = Constants?.expoConfig?.extra?.ENABLE_MOCKS || false;
    const { user, updateUserState, updateLoadingState } = useGlobalContext();
    const { fetchAndPersistAccountDetails } = useTeller();
    const { fetchAndPersistMockAccountDetails } = useMockService();

    const loadUserAccountInfo = async () => {
        updateLoadingState(true);
        if (user) {
            const accounts = user.accounts;
            const connections = user.connections;
            const transactions = user.transactions;
            const accountDetailsRequestBody: AccountDetailsRequest[] = accounts.map((account) => {
                const accessToken = connections.filter(connection => connection.id === account.connectionId)[0].accessToken;

                let transactionId = '';
                if (transactions.length && transactions.some((t => t.accountId === account.id))) {
                    const lastAccountTransaction = transactions.filter(t => t.accountId === account.id)[0];
                    transactionId = lastAccountTransaction.tellerTransactionId || '';
                }

                const body = transactionId !== '' ?
                    {
                        accountId: account.id,
                        accessToken: accessToken ?? '',
                        transactionId
                    }
                    :
                    {
                        accountId: account.id,
                        accessToken: accessToken ?? ''
                    }

                return body;
            })

            if (!mocking) {
                try {

                    const { accounts, transactions } = await fetchAndPersistAccountDetails(accountDetailsRequestBody);
                    updateUserState({
                        ...user,
                        accounts,
                        transactions
                    })
                    updateLoadingState(false);
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.log("deal with mocking stuff");
                console.log("request body: ", accountDetailsRequestBody);
                const { accounts, transactions } = fetchAndPersistMockAccountDetails(accountDetailsRequestBody);
                updateUserState({
                    ...user,
                    accounts,
                    transactions
                })
                updateLoadingState(false);
            }
        }
    }

    useEffect(() => {
        if (user) {
            loadUserAccountInfo()
        }
    }, [])

    return (
        <Stack screenOptions={{ headerShown: false }} />
    )
}
