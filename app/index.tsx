import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import * as schema from '@/db/schema';
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

    const [users, setUsers] = useState<schema.User[]>([]);
    const sqlite = useSQLiteContext();
    const db = drizzle(sqlite, { schema });

    const router = useRouter();

    const clearApp = async () => {
        await db.delete(schema.user);
        setUsers([]);
    }

    useEffect(() => {
        const loadUsers = async () => {
            const users = await db.query.user.findMany();
            console.log(users);
            setUsers(users);
        }

        loadUsers();
    }, []);

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <View>
                    <Text>Edit app/index.tsx to edit this screen.</Text>
                    <FlatList
                        data={users}
                        renderItem={({item}) => <Text>{item.nickname}</Text>}
                    />
                    <TouchableOpacity onPress={() => router.replace("/setup")}>
                        <Text>To setup for now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clearApp}>
                        <Text>Clear app data</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
