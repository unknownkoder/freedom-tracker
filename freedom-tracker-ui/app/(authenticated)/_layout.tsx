import { useEffect, useState } from "react"

import { useGlobalContext } from "@/services/GlobalContext";
import { Redirect, Stack } from "expo-router"

import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateGlobalUserWithNewConnectionAndAccount } from "@/services/teller/sharedTellerHelpers";

export default function AuthenticatedRootLayout() {

    const { user, authState, setLoading, getUserService, getTellerService } = useGlobalContext();
    const {setUser} = getUserService();
    const { fetchAndPersistAccountDetails, persistConnection, persistAccount } = getTellerService();
    const [doneProcessingNewAccounts, setDoneProcessingNewAccounts] = useState<boolean>(false);

    const processIncommingAccount = async () => {
            if (!user) return;

            try {
                const pending = await AsyncStorage.getItem('pendingAccountInfo');
                await AsyncStorage.removeItem('pendingAccountInfo');
                if (pending) {
                    const { enrollment, account } = JSON.parse(pending);

                    await updateGlobalUserWithNewConnectionAndAccount(
                        enrollment,
                        account,
                        persistConnection,
                        persistAccount,
                        setUser,
                        user
                    );
                }
            } catch (err) {
                console.error('Error processing pending account', err);
            } finally {
                setDoneProcessingNewAccounts(true);
            }
        };

    useEffect(() => {
        processIncommingAccount();
    }, []);

    useEffect(() => {
        if (doneProcessingNewAccounts) {
            (async () => {
                await fetchAndPersistAccountDetails();
                setLoading(false);
            })()
        }
    }, [doneProcessingNewAccounts])

    //If we somehow end up here before authentication, redirect the user back to public
    if (authState !== 'AUTHENTICATED') return <Redirect href="/(public)" />

    return (
        <Stack screenOptions={{ headerShown: false }} />
    )
}
