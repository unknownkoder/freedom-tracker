import * as schema from "@/db/schema";

export type GoalSetup = {
    selected?: boolean,
    name: string,
    amount: number,
    type: schema.GoalType,
    recurring: boolean,
    occuranceType: schema.OccuranceType,
    termedEndDate: Date | null
}

export type PersistGoalType = {
    name: string,
    amount: number,
    startDate: string,
    endDate: string | null,
    type: schema.GoalType,
    recurring: boolean,
    occuranceType: schema.OccuranceType,
    userId: number
}
