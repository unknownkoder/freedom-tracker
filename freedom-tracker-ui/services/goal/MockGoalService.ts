import { GoalSetup } from "@/types/goals";
import { GlobalContextReducers, IGoalService } from "@/types/services";
import { GlobalUser } from "../GlobalContext";
import MockDataProvider from "../MockDataProvider";

export default function MockGoalService(globalReducers: GlobalContextReducers, user?: GlobalUser): IGoalService {
    const {goals:mockGoals} = MockDataProvider();

    const persistGoals = async (goalsToPersist: GoalSetup[]): Promise<void> => {
        if(user){
            globalReducers.updateUserState({
            ...user,
            goals: mockGoals
        })
        } 
        Promise.resolve();
    }

    return {
        persistGoals
    }
}
