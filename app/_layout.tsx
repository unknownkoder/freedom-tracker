import { Stack } from "expo-router";
import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from "drizzle-orm/expo-sqlite";
import migrations from '@/drizzle/migrations';
import {useMigrations} from 'drizzle-orm/expo-sqlite/migrator';

const DATABASE_NAME = 'freedom_db';

export default function RootLayout() {

    const expoDB = openDatabaseSync(DATABASE_NAME);
    const db = drizzle(expoDB);
    useMigrations(db, migrations);

    return (
        <SQLiteProvider
            databaseName={DATABASE_NAME}
            options={{ useNewConnection: false }}
        >

            <Stack screenOptions={{ headerShown: false }} />
        </SQLiteProvider>
    );
}
