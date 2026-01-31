import { Stack } from "expo-router";
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from "drizzle-orm/expo-sqlite";
import migrations from '@/drizzle/migrations';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { GlobalContextProvider, useGlobalContext } from "@/services/GlobalContext";
import { SplashScreenController } from "@/components/SplashScreenController";
import { resetDB } from "@/db/resetdb";
import { isFeatureEnabled } from "@/services/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DATABASE_NAME = 'freedom_db';

export default function RootLayout() {

    const expoDB = openDatabaseSync(DATABASE_NAME);
    const db = drizzle(expoDB); 

    const resetAppForTests = async () => {
        resetDB(expoDB);
        const savings = AsyncStorage.setItem('setup-savings', 'false');
        const tracking = AsyncStorage.setItem('setup-tracking', 'false');
        const debt = AsyncStorage.setItem('setup-debt', 'false');
        await Promise.all([savings, tracking, debt]);
    }

    if (isFeatureEnabled('EXPO_PUBLIC_RESET_DATABASE')) {
        console.log("reset app");
        resetAppForTests();
    }

    const { success, error } = useMigrations(db, migrations);

    console.log("success: ", success, error);

    return (
        <SQLiteProvider
            databaseName={DATABASE_NAME}
            options={{ useNewConnection: false }}
        >
            <GlobalContextProvider>
                <SplashScreenController />
                <RootNavigator />
            </GlobalContextProvider>
        </SQLiteProvider>
    );
}

function RootNavigator() {
    const { user } = useGlobalContext();
    const guard = user && user?.id > 0

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!!guard}>
                <Stack.Screen name="(app)" />
            </Stack.Protected>
            <Stack.Protected guard={!guard}>
                <Stack.Screen name="setup" />
            </Stack.Protected>
        </Stack>
    )
}
