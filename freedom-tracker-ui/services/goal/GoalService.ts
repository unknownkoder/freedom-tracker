import { GlobalContextReducers, IGoalService } from "@/types/services";
import { GlobalUser } from "../GlobalContext";
import { GoalSetup, PersistGoalType } from "@/types/goals";

import * as schema from "@/db/schema";

export default function GoalService(dataStore: any, globalReducers: GlobalContextReducers, user?: GlobalUser): IGoalService {

    const mapGoalSetupToPersistGoalType = (goalSetup: GoalSetup): PersistGoalType => {
        return {
            name: goalSetup.name,
            amount: goalSetup.amount,
            type: goalSetup.type,
            startDate: new Date().toISOString().slice(0, 10),
            endDate: goalSetup.termedEndDate?.toISOString().slice(0, 10) ?? null,
            recurring: goalSetup.recurring,
            userId: user?.id || 1,
            occuranceType: goalSetup.occuranceType
        }
    }

    const persistGoals = async (goalsToPersist: GoalSetup[]) => {
        if (user) {
            const persistGoals = goalsToPersist.filter((goal) => {
                if(goal.selected === undefined || goal.selected){
                    return goal;
                }
            }).map(g => mapGoalSetupToPersistGoalType(g));

            if (persistGoals.length > 0) {
                const persistedGoals = await dataStore.insert(schema.goals)
                    .values([...persistGoals])
                    .onConflictDoNothing({ target: schema.goals.id })
                    .returning();
                const currentGoals = user?.goals ?? [];
                globalReducers.updateUserState({
                    ...user,
                    goals: [...currentGoals, ...persistedGoals]
                })
            }
            
            globalReducers.updateAuthState('AUTHENTICATED');
        }
    }

    return {
        persistGoals
    }

}
