import { AccountDetailsRequest } from "@/types/teller";
import { GlobalUser } from "./GlobalContext";

type FeatureFlags = 'EXPO_PUBLIC_RESET_DATABASE';

const isFeatureEnabled = (featureFlag: FeatureFlags) => {
    return process.env[featureFlag] === 'Y';
}

const generateUTCDateWithOffset = (date: string | Date | number): Date => {
    const utcDate = new Date(date);
    utcDate.setTime(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
    return utcDate;
}

const parseDateString = (date: string | Date): string => {
    const utcDate = generateUTCDateWithOffset(date);
    return utcDate.toLocaleDateString();
}

const mapAccountDetailsRequestBody = (user: GlobalUser, startDate?: string): AccountDetailsRequest[] => {
    const accounts = user?.accounts ?? [];
    const connections = user?.connections ?? [];
    const accountDetailsRequestBody: AccountDetailsRequest[] = accounts.map((account) => {
        const accessToken = connections.filter(connection => connection.id === account.connectionId)[0].accessToken;

        return {
            accountId: account.id,
            accessToken: accessToken ?? '',
            startDate
        }
    })

    return accountDetailsRequestBody;
}

export {
    FeatureFlags,
    isFeatureEnabled,
    generateUTCDateWithOffset,
    parseDateString,
    mapAccountDetailsRequestBody
}
