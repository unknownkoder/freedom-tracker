import { useGlobalContext } from "@/services/GlobalContext";
import useTeller from "@/services/TellerService";
import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";

import * as schema from "@/db/schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TellerAccountResponse, TellerConnectResponse } from "@/types/teller";

const ConnectAccount = () => {
    const server = process.env.EXPO_PUBLIC_SERVER_URI || '';

    const webViewRef = useRef<WebView>(null);

    const router = useRouter();

    const [enrollmentData, setEnrollmentData] = useState<TellerConnectResponse | undefined>();
    const [loadingConnectedAccounts, setLoadingConnectedAccounts] = useState<boolean>(true);
    const [accounts, setAccounts] = useState<TellerAccountResponse[]>([]);

    const { redirect } = useLocalSearchParams();
    const { fetchAccountsByAccessToken } = useTeller();

    type ConnectWebViewCallback = {
        data: TellerConnectResponse,
        status: string
    }

    const handleEnroll = (event: WebViewMessageEvent) => {
        const callbackData: ConnectWebViewCallback = JSON.parse(event.nativeEvent.data);
        const enrollmentData: TellerConnectResponse = callbackData.data;
        setEnrollmentData(enrollmentData);
    }

    useEffect(() => {
        if (enrollmentData) {
            //Fetch all accounts associated with the link
            getAccounts();
        }
    }, [enrollmentData])
 
    const getAccounts = async () => {
        const connectedAccounts = await fetchAccountsByAccessToken(enrollmentData?.accessToken || '');
        setAccounts(connectedAccounts);
        setLoadingConnectedAccounts(false);
    }

    const selectAccount = (account: TellerAccountResponse) => {
        const callback = JSON.stringify({
            enrollment: enrollmentData,
            account
        });
        setEnrollmentData(undefined);
        setAccounts([]);
        setLoadingConnectedAccounts(true);
        router.push({
            pathname: redirect,
            params: { callback }
        })
    } 

    const renderTitle = () => {
        if (redirect && redirect === "/setup") {
            return "Choose your Primary Account:"
        } else {
            return "Select account to link:"
        }
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    {enrollmentData ?
                        <View>
                            <Text>{renderTitle()}</Text>
                            {loadingConnectedAccounts ?
                                <ActivityIndicator size="large" />
                                :
                                <View>
                                    <FlatList<TellerAccountResponse>
                                        data={accounts}
                                        renderItem={({ item }) => {
                                            return (
                                                <TouchableOpacity
                                                    onPress={() => selectAccount(item)}
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
