import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, GestureResponderEvent } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import * as schema from '@/db/schema';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGlobalContext } from '@/services/GlobalContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useTeller from '@/services/TellerService';
import { LinkAccountButton } from '@/components/LinkAccountButton';
import { ConnectAccountCallback, TellerAccountResponse, TellerConnectResponse } from '@/types/teller';

const SetupSplash = () => {

    const { user, dataStore, updateUserState } = useGlobalContext();
    const { persistConnection, persistAccount } = useTeller();

    const [usersName, setUsersName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [userNameInputFocused, setUserNameInputFocused] = useState<boolean>(false);
    const [isSavingChecked, setSavingChecked] = useState<boolean>(false);
    const [isTrackingChecked, setTrackingChecked] = useState<boolean>(false);
    const [isDebtChecked, setDebtChecked] = useState<boolean>(false);
    const [enrollment, setEnrollment] = useState<TellerConnectResponse | undefined>();
    const [selectedAccount, setSelectedAccount] = useState<TellerAccountResponse | undefined>();

    const router = useRouter();
    const { callback } = useLocalSearchParams();

    const restorePage = async () => {
        const savings = AsyncStorage.getItem('setup-savings');
        const tracking = AsyncStorage.getItem('setup-tracking');
        const debt = AsyncStorage.getItem('setup-debt');

        const [restoredSavings, restoredTracking, restoredDebt] = await Promise.all(
            [savings, tracking, debt]
        );

        setSavingChecked((restoredSavings === 'true') || false);
        setTrackingChecked((restoredTracking === 'true') || false);
        setDebtChecked((restoredDebt === 'true') || false);
        setUsersName(() => user?.nickname || '');
        setLoading(false);
    }

    useEffect(() => {
        restorePage();
        if (callback) {
            const callbackData: ConnectAccountCallback = JSON.parse(callback as string);
            setEnrollment(callbackData.enrollment);
            setSelectedAccount(callbackData.account);
        }
    }, [])

    const toggleSavings = () => {
        setSavingChecked((saving) => !saving)
    }

    const toggleTracking = () => {
        setTrackingChecked((tracking) => !tracking);
    }

    const toggleDebt = () => {
        setDebtChecked((debt) => !debt);
    }

    const generateGoals = async (user: schema.User) => {
        const goals = [];
        if (isSavingChecked) {
            goals.push({
                name: 'Savings Goal',
                type: 'SAVING',
                userId: user.id
            });
        }

        if (isTrackingChecked) {
            goals.push({
                name: 'Spending Goal',
                type: 'BUDGET',
                userId: user.id
            })
        }

        if (isDebtChecked) {
            goals.push({
                name: 'Debt Reduction Goal',
                type: 'DEBT',
                userId: user.id
            })
        }

        const persistedGoals = await dataStore.insert(schema.goals).values([...goals]).returning();
        return persistedGoals;
    }

    const handleSubmitUserInformation = async (event: GestureResponderEvent) => {
        event.stopPropagation();
        try {

            //Validate the user has filled out their name
            //Later we would want to ensure the user has linked their primary account
            if (!usersName) {
                Alert.alert('Must enter nickname', 'Please enter your nickname to continue', [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ]);
                return;
            }

            console.log("~~~ Starting Persistence Process ~~~")
            const newUser = await dataStore.insert(schema.user).values({ nickname: usersName }).returning();
            const persistedUser = newUser[0];

            const persistedGoals = await generateGoals(persistedUser);

            let persistedConnection;
            let persistedAccount;

            if (persistedUser && enrollment) {
                const connectionToPersist = {
                    id: 0,
                    accessToken: enrollment.accessToken,
                    enrollmentId: enrollment.enrollment.id,
                    tellerUserId: enrollment.user.id,
                    userId: persistedUser.id
                }
                persistedConnection = await persistConnection(connectionToPersist, persistedUser.id);
            } else {
                Alert.alert('Must select your primary account', 'Please link your primary account to continue', [
                    { text: 'OK', onPress: () => { } }
                ])
            }

            if (persistedUser && persistedConnection && selectedAccount) {
                const accountToPersist: schema.Account = {
                    id: selectedAccount.id,
                    institution: selectedAccount.institution.name,
                    lastFour: selectedAccount.last_four,
                    name: selectedAccount.name,
                    isPrimary: true,
                    status: selectedAccount.status.toString(),
                    subtype: selectedAccount.subtype.toString(),
                    type: selectedAccount.type.toString(),
                    currency: selectedAccount.currency,
                    balance: '0.0',
                    connectionId: 0
                }
                persistedAccount = await persistAccount(accountToPersist, persistedConnection.id)
            } else {
                Alert.alert('Must select your primary account', 'Please link your primary account to continue', [
                    { text: 'OK', onPress: () => { } }
                ])
            }

            if (persistedUser && persistedConnection && persistedAccount && persistedGoals) {
                updateUserState({
                    ...persistedUser,
                    goals: persistedGoals[0],
                    connections: [persistedConnection],
                    accounts: [persistedAccount],
                    transactions: []
                });
                await AsyncStorage.multiRemove(['setup-savings', 'setup-debt', 'setup-tracking']);
                router.replace('/(app)');
            } else {
                throw new Error('User setup was not successful');
            }
        } catch (e) {
            console.log(e)
        }
    } 

    const handleUserNameInput = (name: string) => {
        setUsersName(name);

        let updatedUser;

        if (user) {
            updatedUser = {
                ...user,
                nickname: name
            }
        } else {
            updatedUser = {
                id: -1,
                nickname: name,
                goals: [],
                connections: [],
                accounts: [],
                transactions: []
            }
        }

        updateUserState(updatedUser);
    }

    const openConnectAccount = async (event: GestureResponderEvent) => {
        event.stopPropagation();
        await Promise.all([
            AsyncStorage.setItem('setup-savings', JSON.stringify(isSavingChecked)),
            AsyncStorage.setItem('setup-tracking', JSON.stringify(isTrackingChecked)),
            AsyncStorage.setItem('setup-debt', JSON.stringify(isDebtChecked))
        ]);
        router.push({
            pathname: '/connect_account',
            params: { redirect: '/setup' }
        });
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                {loading ?
                    <ActivityIndicator size="large" />
                    :
                    <View style={styles.container}>
                        <Text style={styles.title}>Welcome to the Freedom Tracker</Text>
                        <View style={styles.spacedContent}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.text}>How do you want to be called:</Text>
                                <TextInput
                                    style={[styles.textInput, { outlineWidth: 0 }]}
                                    placeholder="Enter your name"
                                    value={usersName}
                                    onChangeText={handleUserNameInput}
                                    placeholderTextColor="gray"
                                />
                            </View>
                            <View style={{ width: '100%', display: 'flex', gap: 8 }}>
                                <Text style={styles.text}>Select your Goals:</Text>
                                <TouchableOpacity style={styles.goalSelector} onPress={toggleSavings}>
                                    <View style={[styles.goalCheckbox, {
                                        borderWidth: isSavingChecked ? 0 : 1,
                                        backgroundColor: isSavingChecked ? 'blue' : 'transparent'
                                    }
                                    ]}
                                    >
                                        {
                                            isSavingChecked && <Ionicons name="checkmark" size={16} color="#fff" />
                                        }
                                    </View>
                                    <Text style={styles.goalText}>Saving Money</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.goalSelector} onPress={toggleTracking}>
                                    <View style={[styles.goalCheckbox, {
                                        borderWidth: isTrackingChecked ? 0 : 1,
                                        backgroundColor: isTrackingChecked ? 'blue' : 'transparent'
                                    }
                                    ]}
                                    >
                                        {
                                            isTrackingChecked && <Ionicons name="checkmark" size={16} color="#fff" />
                                        }
                                    </View>
                                    <Text style={styles.goalText}>Tracking Expenses</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.goalSelector} onPress={toggleDebt}>
                                    <View style={[styles.goalCheckbox, {
                                        borderWidth: isDebtChecked ? 0 : 1,
                                        backgroundColor: isDebtChecked ? 'blue' : 'transparent'
                                    }
                                    ]}
                                    >
                                        {
                                            isDebtChecked && <Ionicons name="checkmark" size={16} color="#fff" />
                                        }
                                    </View>
                                    <Text style={styles.goalText}>Reducing Debt</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingVertical: 16, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {selectedAccount
                                    ?
                                    <View>
                                        <Text>Primary Account Successfully Connected</Text>
                                        <Text>{selectedAccount.institution.name} {selectedAccount.name} ending in ...{selectedAccount.last_four}</Text>
                                    </View>
                                    :
                                    <LinkAccountButton onPress={openConnectAccount}>
                                        <Image
                                            source={require('../assets/images/Plaid-black.png')}
                                            style={styles.connectImage}
                                            resizeMode="contain"
                                        />
                                        <Text style={styles.text}>Link your bank account with Plaid</Text>
                                    </LinkAccountButton>
                                }
                            </View>
                            <TouchableOpacity style={styles.submit} onPress={handleSubmitUserInformation}>
                                <Text style={styles.text}>Submit and Complete Setup</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        height: "100%",
        paddingVertical: 16,
        paddingHorizontal: 12
    },
    spacedContent: {
        width: '100%',
        flex: 1,
        gap: 16,
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    title: {
        fontSize: 24,
        fontWeight: 800
    },
    text: {
        fontSize: 18,
        fontWeight: 600,
    },
    inputWrapper: {
        display: 'flex',
        //flex: 1,
        width: "100%",
        paddingVertical: 8,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 8,
    },
    textInput: {
        width: "100%",
        padding: 8,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 8,
        fontSize: 16,
    },
    goalSelector: {
        width: '100%',
        paddingHorizontal: 12,
        height: 64,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: 'gray'
    },
    goalCheckbox: {
        width: 24,
        height: 24,
        //borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    goalText: {
        fontSize: 16
    },
    connectImage: {
        width: 32,
        height: 32,
        objectFit: 'contain'
    },
    submit: {
        width: '100%',
        height: 64,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default SetupSplash;
