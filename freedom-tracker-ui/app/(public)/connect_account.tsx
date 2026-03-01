import { useGlobalContext } from "@/services/GlobalContext";
import useTellerService from "@/services/teller/TellerService";
import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";

import { useLocalSearchParams, useRouter, Href } from "expo-router";
import { TellerAccountResponse, TellerConnectResponse } from "@/types/teller";
import Constants from "expo-constants";
import useMockService from "@/services/MockService";

import AsyncStorage from '@react-native-async-storage/async-storage';
import MockDataProvider from "@/services/MockDataProvider";

const ConnectAccount = () => {
    const server = process.env.EXPO_PUBLIC_SERVER_URI || '';
    const mocking = Constants?.expoConfig?.extra?.ENABLE_MOCKS || false;

    const { redirect } = useLocalSearchParams<{ redirect: string }>();
    const { setLoading, getTellerService } = useGlobalContext();
    const { fetchAccountsByAccessToken } = getTellerService();
    const { enrollmentData: mockEnrollmentData } = MockDataProvider();

    const webViewRef = useRef<WebView>(null);

    const router = useRouter();

    const [enrollmentData, setEnrollmentData] = useState<TellerConnectResponse | undefined>(() => {
        if (mocking) return mockEnrollmentData;
    });
    const [loadingConnectedAccounts, setLoadingConnectedAccounts] = useState<boolean>(true);
    const [accounts, setAccounts] = useState<TellerAccountResponse[]>([]);



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
            console.log("enrollment data", enrollmentData);
            //Fetch all accounts associated with the link
            getAccounts();
        }
    }, [enrollmentData])

    const getAccounts = async () => {
        const connectedAccounts = await fetchAccountsByAccessToken(enrollmentData?.accessToken || '');
        setAccounts(connectedAccounts);
        setLoadingConnectedAccounts(false);
    }

    const selectAccount = async (account: TellerAccountResponse) => {
        let enrollment = JSON.parse(JSON.stringify(enrollmentData));
        enrollment.enrollment = mocking ?
            {
                id: account.enrollmentId,
                institution: {
                    id: account.institution.id,
                    name: account.institution.name
                }
            }
            :
            enrollmentData?.enrollment
        console.log(enrollment);
        const accountData = JSON.stringify({
            enrollment,
            account
        });
        console.log("selectAccount data: ", accountData);
        await AsyncStorage.setItem(
            'pendingAccountInfo', accountData
        )
        setEnrollmentData(undefined);
        setAccounts([]);
        setLoadingConnectedAccounts(true);
        setLoading(true);
        router.replace(redirect as Href)
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
