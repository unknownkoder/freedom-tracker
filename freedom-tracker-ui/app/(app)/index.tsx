import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import * as schema from '@/db/schema';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "@/services/GlobalContext";
import { useRouter } from "expo-router";

export default function Index() {
    
    const {user, loading } = useGlobalContext();

    const router = useRouter(); 
    
    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <View>
                    {!user ?
                        <ActivityIndicator size="large" />
                        :
                        <View>
                            <Text>Welcome {user.nickname}</Text>
                            {loading ?
                                <ActivityIndicator size="large" />
                                :
                                <View>
                                    <Text>Bank Account: {user.accounts[0].name} ...{user.accounts[0].lastFour}</Text>
                                    <Text>{user.accounts[0].balance}</Text>
                                    <Text>Transactions</Text>
                                    {user?.transactions?.length > 0 && <FlatList<schema.Transaction>
                                        data={user.transactions}
                                        renderItem={({item}) => {
                                            const account = user.accounts.filter(account => account.id === item.accountId)[0];
                                            let date;
                                            if(item.date){
                                                const [year, month, day] = item.date.split('-').map(Number);
                                                date = new Date(year, month - 1, day);
                                            } 
                                            return (
                                                <View>
                                                    <Text>Transaction</Text>
                                                    <Text>Account: {account.name} ... {account.lastFour}</Text>
                                                    <Text>$ {item.amount}</Text>
                                                    {date && <Text>On: {date.toDateString()}</Text>}
                                                </View>
                                            )
                                        }}
                                        keyExtractor={(item) => item.id.toString()}
                                    />}
                                </View>
                            } 
                        </View>
                    }
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
