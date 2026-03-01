import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, GestureResponderEvent, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as schema from '@/db/schema';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGlobalContext } from '@/services/GlobalContext';
import { LinkAccountButton } from '@/components/LinkAccountButton';
import { ConnectAccountCallback, TellerAccountResponse, TellerConnectResponse } from '@/types/teller';
import { SetupScreenGoalCard } from '@/components/Goals/SetupScreenGoalCard';
import { GoalSetup } from '@/types/goals';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SetupSplash = () => {

    const {loading, authState, user, setLoading, getUserService, getGoalService } = useGlobalContext();
    const { persistNewUser, setUser } = getUserService();
    const { persistGoals } = getGoalService();

    /* Connect account and redirect related logic */
    const router = useRouter();

    const handleNavigateBackFromConnectAccount = async () => {
        const pendingAccounts = await AsyncStorage.getItem('pendingAccountInfo');
        if(pendingAccounts){
            const {enrollment, account} = JSON.parse(pendingAccounts);
            setEnrollment(enrollment);
            setSelectedAccount(account);
        }
    }
    const [enrollment, setEnrollment] = useState<TellerConnectResponse | undefined>();
    const [selectedAccount, setSelectedAccount] = useState<TellerAccountResponse | undefined>();

    const openConnectAccount = async (event: GestureResponderEvent) => {
        event.stopPropagation();
        console.log("open connect screen");
        router.push({
            pathname: '/connect_account',
            params: { redirect: '/(public)' }
        });
    }

    //Check for callback data from connect account
    useEffect(() => {
        setLoading(true);
        handleNavigateBackFromConnectAccount(); 
        setLoading(false);
    }, []) 

    /* User related logic */
    const [usersName, setUsersName] = useState<string>(user?.nickname ?? '');
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
                goals: undefined,
                connections: undefined,
                accounts: undefined,
                transactions: undefined
            }
        }

        setUser(updatedUser);
    }

    /* Goal Related logic */
    const [savingsGoal, setSavingsGoal] = useState<GoalSetup>({
        selected: false,
        name: '',
        amount: 0.0,
        type: 'SAVINGS' as schema.GoalType,
        recurring: false,
        occuranceType: 'WEEKLY',
        termedEndDate: null,
    });
    const [trackingGoal, setTrackingGoal] = useState<GoalSetup>({
        selected: false,
        name: '',
        amount: 0.0,
        type: 'BUDGET' as schema.GoalType,
        recurring: false,
        occuranceType: 'WEEKLY',
        termedEndDate: null
    })
    const [debtGoal, setDebtGoal] = useState<GoalSetup>({
        selected: false,
        name: '',
        amount: 0.0,
        type: 'DEBT' as schema.GoalType,
        recurring: false,
        occuranceType: 'WEEKLY',
        termedEndDate: null
    })

    const toggleSavings = () => {
        setSavingsGoal({
            ...savingsGoal,
            selected: !savingsGoal.selected
        })
    }

    const toggleTracking = () => {
        setTrackingGoal({
            ...trackingGoal,
            selected: !trackingGoal.selected
        });
    }

    const toggleDebt = () => {
        setDebtGoal({
            ...debtGoal,
            selected: !debtGoal.selected
        });
    }

    /* User Persistence Process */
    //Step 1. Persist the user from the database, set the global users id
    const handleStartUserPersistenceProcess = async (event: GestureResponderEvent) => {
        event.stopPropagation();
        try {
            //Validate the user has filled out their name
            if (!usersName) {
                Alert.alert('Must enter nickname', 'Please enter your nickname to continue', [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ]);
                return;
            }

            //Validate they have selected an account
            if (!selectedAccount && !enrollment) {
                Alert.alert('Must select your primary account', 'Please link your primary account to continue', [
                    { text: 'OK', onPress: () => { } }
                ])
            }

            //persistNewUser sets the global users id to > 0 and triggers the goal creation set
            await persistNewUser(usersName);
        } catch (e) {
            console.log(e)
        }
    }
    
    //Step 2. Persist any goals the user filled out
    useEffect(() => {
        if (user && user.id > 0) {
            (async function() {
                await persistGoals([savingsGoal, trackingGoal, debtGoal]);
            })()
        }
    }, [user?.id])

    //Step 3. User id and goals are persisted, user is authenticated, push user to authenticated experience
    //pass the authenticated experience the account information to fetch transaction and balance data
    useEffect(() => {
        if (authState === 'AUTHENTICATED') {
            setLoading(true);
            router.replace({
                pathname: '/(authenticated)',
            });
        }
    }, [authState])

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
                                                source={require('../../assets/images/Plaid-black.png')}
                                                style={styles.connectImage}
                                                resizeMode="contain"
                                            />
                                            <Text style={styles.text}>Link your bank account with Plaid</Text>
                                        </LinkAccountButton>
                                    }
                                </View>
                                {selectedAccount &&
                                    <View style={{ width: '100%', display: 'flex', gap: 8 }}>
                                        <Text style={styles.text}>Select your Goals:</Text>
                                        <SetupScreenGoalCard
                                            goalType='SAVING'
                                            isChecked={savingsGoal.selected || false}
                                            title={"Saving Money"}
                                            subtitle={"Set a savings target, and watch your savings account grow."}
                                            selectGoal={toggleSavings}
                                            updateGoal={setSavingsGoal}
                                        />
                                        <SetupScreenGoalCard
                                            goalType='BUDGET'
                                            isChecked={trackingGoal.selected || false}
                                            title={"Tracking Expenses"}
                                            subtitle={"Track the money coming in and out of your account on a daily basis."}
                                            selectGoal={toggleTracking}
                                            updateGoal={setTrackingGoal}
                                        />
                                        <SetupScreenGoalCard
                                            goalType='DEBT'
                                            isChecked={debtGoal.selected || false}
                                            title={"Reduce Debt"}
                                            subtitle={"Reduce your debt one small chunk at a time until it disapears."}
                                            selectGoal={toggleDebt}
                                            updateGoal={setDebtGoal}
                                        />
                                    </View>
                                }
                                <TouchableOpacity
                                    disabled={!selectedAccount}
                                    style={[styles.submit, selectedAccount ? styles.submitActive : styles.submitInactive]}
                                    onPress={handleStartUserPersistenceProcess}
                                >
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
    },
    submitActive: {
        backgroundColor: 'transparent'
    },
    submitInactive: {
        backgroundColor: 'rgba(0,0,0,0.2)'
    }
})

export default SetupSplash;
