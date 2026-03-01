import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { TouchableOpacity, View, Text, GestureResponderEvent, StyleSheet, TextInput } from "react-native"
import DateTimePicker from '@react-native-community/datetimepicker';
import * as schema from "@/db/schema";
import { GoalSetup } from "@/types/goals";

interface SetupScreenGoalCardProps {
    goalType: schema.GoalType;
    isChecked: boolean;
    title: string;
    subtitle: string;
    selectGoal: (event: GestureResponderEvent) => void;
    updateGoal: (goal:GoalSetup) => void;
}

type GoalProperties = {
    name: string;
    amount: number;
    duration: 'Recuring' | 'Termed';
    selectedOcurance: 'Weekly' | 'Monthly' | 'Yearly';
    termEndDate: Date;
}

export const SetupScreenGoalCard: React.FC<SetupScreenGoalCardProps> = ({
    goalType,
    isChecked,
    title,
    subtitle,
    selectGoal,
    updateGoal
}) => {

    const occurances = [
        { type: 'Weekly', subtitle: "Reset every Sunday" },
        { type: 'Monthly', subtitle: "Reset at the start of each month" },
        { type: 'Yearly', subtitle: "Restart on the first of the year" }
    ];

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [goal, setGoal] = useState<GoalProperties>({
        name: '',
        amount: 0.0,
        duration: 'Recuring',
        selectedOcurance: 'Weekly',
        termEndDate: new Date()
    });
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

    const [recuringSelectOpen, setRecuringSelectOpen] = useState<boolean>(false);

    const handleSelectClicked = (e: GestureResponderEvent) => {
        if (!isChecked) {
            handleOpenCardClicked(e);
        }

        selectGoal(e);
    }

    const handleOpenCardClicked = (e: GestureResponderEvent) => {
        setIsOpen(open => !open);
    }

    const handleNameChange = (name: string) => {
        setGoal({
            ...goal,
            name
        })
    }

    const handleSelectRecuring = (e: GestureResponderEvent) => {
        if (goal.duration !== 'Recuring') {
            setGoal({
                ...goal,
                duration: 'Recuring'
            })
        }
    }

    const handleSelectTermed = (e: GestureResponderEvent) => {
        if (goal.duration !== 'Termed') {
            setShowDatePicker(true);
            setGoal({
                ...goal,
                duration: 'Termed'
            })
        }
    }

    const openOcuranceSelect = () => {
        setRecuringSelectOpen(open => !open);
    }

    const selectOcurance = (ocurance: string) => {
        setGoal({
            ...goal,
            selectedOcurance: ocurance as 'Weekly' | 'Monthly' | 'Yearly'
        });
        openOcuranceSelect();
    }

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setGoal({
            ...goal,
            termEndDate: currentDate
        })
        setShowDatePicker(false);
    }

    const openDatePicker = () => {
        setShowDatePicker(true)
    }

    const handleAmountChange = (amount:string) => {
        setGoal({
            ...goal,
            amount: +amount
        })
    }

    useEffect(() => {
        updateGoal({
            selected: isChecked,
            name: goal.name,
            amount: goal.amount,
            type: goalType,
            recurring: goal.duration === 'Recuring',
            occuranceType: goal.selectedOcurance.toUpperCase() as schema.OccuranceType,
            termedEndDate: goal.termEndDate
        })        
    }, [goal])

    return (
        <View style={styles.goalCard}>
            <View style={styles.goalSelector}>
                <TouchableOpacity style={[styles.goalCheckbox, {
                    borderWidth: isChecked ? 0 : 1,
                    backgroundColor: isChecked ? 'blue' : 'transparent'
                }
                ]}
                    onPress={handleSelectClicked}
                >
                    {
                        isChecked && <Ionicons name="checkmark" size={16} color="#fff" />
                    }
                </TouchableOpacity>
                <View style={styles.goalTextContainer}>
                    <Text style={styles.goalTitle}>{title}</Text>
                    <Text style={styles.goalSubtitle}>{subtitle}</Text>
                </View>
                <TouchableOpacity onPress={handleOpenCardClicked}>
                    <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="#000" />
                </TouchableOpacity>
            </View>
            {isOpen &&
                <View>
                    <View style={styles.breakLine}></View>
                    <View>
                        <Text>What are you tracking?</Text>
                        <TextInput
                            placeholder="Goal name"
                            value={goal.name}
                            onChangeText={handleNameChange}
                            placeholderTextColor="gray"
                        />
                    </View>
                    <View style={styles.goalDurationSelect}>
                        <Text>What is the duration of the goal?</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity style={[styles.radio, {
                                borderWidth: goal.duration === 'Recuring' ? 0 : 1,
                                backgroundColor: goal.duration === 'Recuring' ? 'blue' : 'transparent'
                            }
                            ]}
                                onPress={handleSelectRecuring}
                            >
                                {goal.duration === 'Recuring' &&
                                    <View style={styles.radioSelected}></View>
                                }
                            </TouchableOpacity>
                            <Text>Recuring</Text>
                        </View>
                        {goal.duration === 'Recuring' &&
                            <View style={styles.goalDurationOptions}>
                                <Text>Select the occurance duration:</Text>
                                <View style={styles.occuranceSelect}>
                                    <TouchableOpacity
                                        onPress={openOcuranceSelect}
                                        style={[styles.occuranceSelected, {
                                            paddingBottom: recuringSelectOpen ? 4 : 8,
                                        }]}
                                    >
                                        <View style={styles.occuranceSelectedTextGroup}>
                                            <Text>{goal.selectedOcurance}</Text>
                                            <Ionicons name={recuringSelectOpen ? "chevron-up" : "chevron-down"} size={16} color="#000" />
                                        </View>
                                    </TouchableOpacity>
                                    {recuringSelectOpen &&
                                        <View style={styles.occuranceSelectOptions}>
                                            {occurances.map((occurance) => {
                                                return (
                                                    <TouchableOpacity
                                                        key={occurance.type}
                                                        onPress={() => selectOcurance(occurance.type)}
                                                        style={styles.occuranceSelectOption}
                                                    >
                                                        <Text>{occurance.type} ({occurance.subtitle})</Text>
                                                    </TouchableOpacity>
                                                )
                                            })}
                                        </View>
                                    }
                                </View>
                            </View>
                        }
                        <View style={styles.radioGroup}>
                            <TouchableOpacity style={[styles.radio, {
                                borderWidth: goal.duration === 'Termed' ? 0 : 1,
                                backgroundColor: goal.duration === 'Termed' ? 'blue' : 'transparent'
                            }
                            ]}
                                onPress={handleSelectTermed}
                            >
                                {goal.duration === 'Termed' &&
                                    <View style={styles.radioSelected}></View>
                                }
                            </TouchableOpacity>
                            <Text>Termed</Text>
                        </View>
                        {goal.duration === 'Termed' &&
                            <View style={styles.goalDurationOptions}>
                                <Text>Select your goal target date:</Text>
                                {showDatePicker &&
                                    <DateTimePicker
                                        testID="termEndDatePicker"
                                        value={goal.termEndDate}
                                        mode="date"
                                        is24Hour={false}
                                        onChange={handleDateChange}
                                    />
                                }
                                <Text>Selected goal end date: {goal.termEndDate.toDateString()}</Text>
                                <TouchableOpacity onPress={openDatePicker} style={styles.termedUpdateDate}>
                                    <Text style={styles.termedUpdateDateText}>Update goal end date</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                    <View>
                        <Text>What is your goal amount?</Text>
                        <TextInput
                            placeholder="Goal amount"
                            keyboardType="numeric"
                            value={goal.amount < 1 ? '' : `${goal.amount}`}
                            onChangeText={handleAmountChange}
                            placeholderTextColor="gray"
                        />
                    </View>
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    goalCard: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: 'gray'
    },
    goalSelector: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 16,
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
    goalTextContainer: {
        width: '75%'
    },
    goalTitle: {
        fontSize: 20,
        lineHeight: 24,
        fontWeight: 600
    },
    goalSubtitle: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: 400
    },
    breakLine: {
        width: '100%',
        height: 1,
        marginVertical: 12,
        backgroundColor: 'gray'
    },
    goalDurationSelect: {
        width: '100%',
        display: 'flex',
        gap: 12
    },
    goalDurationOptions: {
        paddingHorizontal: 12
    },
    radioGroup: {
        paddingHorizontal: 8,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8
    },
    radio: {
        height: 24,
        width: 24,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'gray',
        borderRadius: '100%'
    },
    radioSelected: {
        height: 8,
        width: 8,
        borderWidth: 0,
        borderRadius: '100%',
        backgroundColor: '#FFF'
    },
    occuranceSelect: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
    },
    occuranceSelected: {
        width: '100%',
        paddingTop: 8,
        paddingHorizontal: 8
    },
    occuranceSelectedTextGroup: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    occuranceSelectOptions: {
        width: '100%',
        paddingTop: 4,
        paddingBottom: 8,
        paddingHorizontal: 8,
        display: 'flex',
        gap: 4
    },
    occuranceSelectOption: {
        borderTopWidth: 1,
        borderTopColor: 'gray',
        paddingVertical: 4
    },
    termedUpdateDate: {
        width: '100%',
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'blue',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    termedUpdateDateText: {
        color: 'white'
    }
})
