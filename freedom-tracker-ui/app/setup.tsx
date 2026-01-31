import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, GestureResponderEvent, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import * as schema from '@/db/schema';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGlobalContext } from '@/services/GlobalContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useTeller from '@/services/TellerService';
import { LinkAccountButton } from '@/components/LinkAccountButton';
import { ConnectAccountCallback, TellerAccountResponse, TellerConnectResponse } from '@/types/teller';
import { SetupScreenGoalCard } from '@/components/Goals/SetupScreenGoalCard';

export type GoalSetup = {
    name: string,
    amount: number,
    type: schema.GoalType,
    recurring: boolean,
    occuranceType: schema.OccuranceType,
    termedEndDate: Date | null
}

const SetupSplash = () => {

    const { user, dataStore, updateUserState } = useGlobalContext();
    const { persistConnection, persistAccount } = useTeller();

    const [usersName, setUsersName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [isSavingChecked, setSavingChecked] = useState<boolean>(false);
    const [savingsGoal, setSavingsGoal] = useState<GoalSetup>({
        name: '',
        amount: 0.0,
        type: 'SAVINGS' as schema.GoalType,
        recurring: false,
        occuranceType: 'WEEKLY',
        termedEndDate: null,
    });
    const [isTrackingChecked, setTrackingChecked] = useState<boolean>(false);
    const [trackingGoal, setTrackingGoal] = useState<GoalSetup>({
        name: '',
        amount: 0.0,
        type: 'BUDGET' as schema.GoalType,
        recurring: false,
        occuranceType: 'WEEKLY',
        termedEndDate: null
    })
    const [isDebtChecked, setDebtChecked] = useState<boolean>(false);
    const [debtGoal, setDebtGoal] = useState<GoalSetup>({
        name: '',
        amount: 0.0,
        type: 'DEBT' as schema.GoalType,
        recurring: false,
        occuranceType: 'WEEKLY',
        termedEndDate: null
    })

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

    type PersistGoalType = {
        name: string,
        amount: number,
        startDate: string,
        endDate: string | null,
        type: schema.GoalType,
        recurring: boolean,
        occuranceType: schema.OccuranceType,
        userId: number
    }

    const generateGoals = async (user: schema.User) => {
        const goals: PersistGoalType[] = [];
        const mapGoalSetupToPersistGoalType = (goalSetup:GoalSetup, user: schema.User): PersistGoalType => {
            return {
                name: goalSetup.name,
                amount: goalSetup.amount,
                type: goalSetup.type,
                startDate: new Date().toISOString().slice(0, 10),
                endDate: goalSetup.termedEndDate?.toISOString().slice(0, 10) ?? null,
                recurring: goalSetup.recurring,
                userId: user.id,
                occuranceType: goalSetup.occuranceType
            }
        }
        if (isSavingChecked) {
            goals.push(mapGoalSetupToPersistGoalType(savingsGoal, user));
        }

        if (isTrackingChecked) {
            goals.push(mapGoalSetupToPersistGoalType(trackingGoal, user));
        }

        if (isDebtChecked) {
            goals.push(mapGoalSetupToPersistGoalType(debtGoal, user));
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
                    goals: persistedGoals,
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
                <ScrollView>
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
                                    <SetupScreenGoalCard
                                        goalType='SAVING'
                                        isChecked={isSavingChecked}
                                        title={"Saving Money"}
                                        subtitle={"Set a savings target, and watch your savings account grow."}
                                        selectGoal={toggleSavings}
                                        updateGoal={setSavingsGoal}
                                    />
                                    <SetupScreenGoalCard
                                        goalType='BUDGET'
                                        isChecked={isTrackingChecked}
                                        title={"Tracking Expenses"}
                                        subtitle={"Track the money coming in and out of your account on a daily basis."}
                                        selectGoal={toggleTracking}
                                        updateGoal={setTrackingGoal}
                                    />
                                    <SetupScreenGoalCard
                                        goalType='DEBT'
                                        isChecked={isDebtChecked}
                                        title={"Reduce Debt"}
                                        subtitle={"Reduce your debt one small chunk at a time until it disapears."}
                                        selectGoal={toggleDebt}
                                        updateGoal={setDebtGoal}
                                    />
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
                </ScrollView>
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
