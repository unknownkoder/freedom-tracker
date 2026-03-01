import { Slot } from "expo-router";
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from "drizzle-orm/expo-sqlite";
import migrations from '@/drizzle/migrations';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { GlobalContextProvider } from "@/services/GlobalContext";
import { SplashScreenController } from "@/components/SplashScreenController";
import { resetDB } from "@/db/resetdb";
import { isFeatureEnabled } from "@/services/utils";
import { useEffect, useMemo } from "react";

const DATABASE_NAME = 'freedom_db';

export default function RootLayout() {
    const [expoDB, db] = useMemo(() => {
        const expoDB = openDatabaseSync(DATABASE_NAME);
        const db = drizzle(expoDB);

        return [expoDB, db];
    }, []);

    useMigrations(db, migrations);

    useEffect(() => {
        if (isFeatureEnabled("EXPO_PUBLIC_RESET_DATABASE")) {
            (async () => {
                await resetDB(expoDB);
            })();
        }
    }, []);

    return (
        <SQLiteProvider
            databaseName={DATABASE_NAME}
            options={{ useNewConnection: false }}
        >
            <GlobalContextProvider>
                <SplashScreenController />
                <Slot />
            </GlobalContextProvider>
        </SQLiteProvider>
    )
}
