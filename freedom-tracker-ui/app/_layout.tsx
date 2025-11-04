import { Stack } from "expo-router";
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from "drizzle-orm/expo-sqlite";
import migrations from '@/drizzle/migrations';
import {useMigrations} from 'drizzle-orm/expo-sqlite/migrator';
import { GlobalContextProvider, useGlobalContext } from "@/services/GlobalContext";
import { SplashScreenController } from "@/components/SplashScreenController";
import { useEffect } from "react";

const DATABASE_NAME = 'freedom_db';

export default function RootLayout() {

    const expoDB = openDatabaseSync(DATABASE_NAME);
    const db = drizzle(expoDB); 

    const {success, error} = useMigrations(db, migrations);

    console.log('success: ', success);

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

function RootNavigator(){
    const {user} = useGlobalContext();
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
