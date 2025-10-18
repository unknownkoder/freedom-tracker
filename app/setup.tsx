import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';
import { useRouter } from 'expo-router';

const SetupSplash = () => {

    const [usersName, setUsersName] = useState<string>("");
    const [userNameInputFocused, setUserNameInputFocused] = useState<boolean>(false);
    const [isSavingChecked, setSavingChecked] = useState<boolean>(false);
    const [isTrackingChecked, setTrackingChecked] = useState<boolean>(false);
    const [isDebtChecked, setDebtChecked] = useState<boolean>(false);

    const db = useSQLiteContext();
    const drizzleDB = drizzle(db, { schema });

    const router = useRouter();

    const toggleSavings = () => {
        setSavingChecked((saving) => !saving)
    }

    const toggleTracking = () => {
        setTrackingChecked((tracking) => !tracking);
    }

    const toggleDebt = () => {
        setDebtChecked((debt) => !debt);
    }

    const handleSubmitUserInformation = async () => {
        try {
            //Validate the user has filled out their name
            //Later we would want to ensure the user has linked their primary account
            if (!usersName) {
                Alert.alert('Must enter nickname', 'Please enter your nickname to continue', [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ]);
                return;
            }
            const newUser = await drizzleDB.insert(schema.user).values({ nickname: usersName }).returning();
            console.log(newUser);
            if (newUser) {
                router.replace("/");
            }
        } catch (e) {
            console.log(e)
        }
    }

    const handleUserNameInput = (name: string) => {
        setUsersName(name);
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Welcome to the Freedom Tracker</Text>
                <View style={styles.spacedContent}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.text}>How do you want to be called:</Text>
                        <TextInput
                            style={[styles.textInput, { outlineWidth: 0 }]}
                            placeholder="Enter your name"
                            value={usersName}
                            onChangeText={handleUserNameInput}
                            onFocus={() => setUserNameInputFocused(true)}
                            onBlur={() => setUserNameInputFocused(false)}
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
                        <TouchableOpacity style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Image
                                source={require('../assets/images/Plaid-black.png')}
                                style={styles.connectImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.text}>Link your bank account with Plaid</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.submit} onPress={handleSubmitUserInformation}>
                        <Text style={styles.text}>Submit and Complete Setup</Text>
                    </TouchableOpacity>
                </View>
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
