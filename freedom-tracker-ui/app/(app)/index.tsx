import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import * as schema from '@/db/schema';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "@/services/GlobalContext";
import { useEffect, useMemo } from "react";
import { useRouter } from "expo-router";

export default function Index() {
    
    const {user, dataStore, updateUserState } = useGlobalContext();

    const router = useRouter();

    const clearApp = async () => {
        await dataStore.delete(schema.user);
        await dataStore.delete(schema.goals);
        await dataStore.delete(schema.accounts);
        await dataStore.delete(schema.connections);
        updateUserState(undefined);
        router.replace('/setup');
    }
    
    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <View>
                    {!user ?
                        <ActivityIndicator size="large" />
                        :
                        <View>
                            <Text>Welcome {user.nickname}</Text>  
                            <TouchableOpacity onPress={clearApp}>
                            <Text>Clear app data</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
