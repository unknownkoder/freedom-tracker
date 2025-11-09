import { useGlobalContext } from "@/services/GlobalContext";
import useTeller from "@/services/TellerService";
import { AccountDetailsRequest } from "@/types/teller";
import { Stack } from "expo-router"
import { useEffect } from "react"

export default function RootLayout() {

    const { user, updateUserState, updateLoadingState } = useGlobalContext();
    const {fetchAndPersistAccountDetails} = useTeller();

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
