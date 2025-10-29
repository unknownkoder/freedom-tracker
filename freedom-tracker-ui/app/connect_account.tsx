import { useGlobalContext } from "@/services/GlobalContext";
import useTeller from "@/services/TellerService";
import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";

import * as schema from "@/db/schema";
import { useRouter } from "expo-router";

const ConnectAccount = () => {
    const server = process.env.EXPO_PUBLIC_SERVER_URI || ''
    const webViewRef = useRef<WebView>(null);

    const router = useRouter();

    const { user, updateUserState } = useGlobalContext();
    const { fetchAccountsByAccessToken } = useTeller();

    const [connectComplete, setConnectComplete] = useState<boolean>(false);
    const [loadingConnectedAccounts, setLoadingConnectedAccounts] = useState<boolean>(true);
    const [accounts, setAccounts] = useState([]);

    const onEnroll = async (event: WebViewMessageEvent) => {
        const userData = JSON.parse(event.nativeEvent.data);

        console.log(userData.data);
        const information = {
            id: 0,
            accessToken: userData.data.accessToken,
            enrollmentId: userData.data.enrollment.id,
            tellerUserId: userData.data.user.id,
            userId: 0
        }
        if (user) {
            updateUserState({
                ...user,
                connections: [information],
                accounts: []
            })
        } else {
            updateUserState({
                id: -1,
                nickname: '',
                connections: [information],
                accounts: []
            })
        }
    }

    const handleEnroll = (event: WebViewMessageEvent) => {
        onEnroll(event);
        setConnectComplete(true);
    }

    const getAccounts = async () => {
        console.log("in getAccounts");
        if (user && user.connections.length === 1) {
            console.log("user and connections exists");
            console.log(user.connections[0].accessToken);
            const connectedAccounts = await fetchAccountsByAccessToken(user.connections[0].accessToken ?? '');
            console.log(connectedAccounts);
            setAccounts(connectedAccounts);
            setLoadingConnectedAccounts(false);
        }
    }

    const setPrimaryAccount = (account) => {
        const accountToSave:schema.Account = {
            id: account.id,
            name: account.name,
            institution: account.institution.name,
            lastFour: account.last_four,
            isPrimary: true,
            status: account.status,
            subtype: account.subtype,
            type: account.type,
            currency: account.currency,
            connectionId: 0
        }

        if(user){
            updateUserState({
                ...user,
                accounts: [accountToSave]
            })
        } else {
            updateUserState({
                id: 0,
                nickname: '',
                connections: [],
                accounts: [accountToSave]
            })
        }
    }

    useEffect(() => {
        if (connectComplete && user && user.connections.length !== 0) {
            //Fetch all accounts associated with the link
            getAccounts();
        }
    }, [setConnectComplete, user?.connections.length])

    useEffect(() => {
        if(user && user.accounts.length === 1){
            console.log("Its time to go home");
            console.log(user);
            router.replace("/setup");
        }
    }, [user?.accounts.length])

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    {connectComplete ?
                        <View>
                            <Text>Choose Your Primary Account:</Text>
                            {loadingConnectedAccounts ?
                                <ActivityIndicator size="large" />
                                :
                                <View>
                                    <FlatList
                                        data={accounts}
                                        renderItem={({item}) => {
                                            return (
                                                <TouchableOpacity
                                                    onPress={() => setPrimaryAccount(item)}
                                                    style={{
                                                        flex: 1,
                                                        width: '100%',
                                                        padding: 12,
                                                        borderWidth: 1,
                                                        borderColor: 'black',
                                                        marginBottom: 8
                                                    }}
                                                >
                                                    <View>
                                                        <Text>{item.institution.name} {item.last_four}</Text>
                                                        <Text>{item.name} {item.subtype}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        }}
                                        keyExtractor={(item) => item.id.toString()}
                                    />
                                </View>
                            }
                        </View>
                        :
                        <WebView
                            ref={webViewRef}
                            originWhitelist={["*"]}
                            source={{ uri: `http://${server}:8000` }}
                            javaScriptEnabled={true}
                            onMessage={handleEnroll}
                            scalesPageToFit={true}
                        />
                    }
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )

}

export default ConnectAccount;
