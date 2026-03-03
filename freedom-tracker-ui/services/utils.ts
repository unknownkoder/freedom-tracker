type FeatureFlags = 'EXPO_PUBLIC_RESET_DATABASE' | 'EXPO_PUBLIC_REFETCH_TRANSACTIONS'; 

const isFeatureEnabled = (featureFlag:FeatureFlags) => {
    return process.env[featureFlag] === 'Y';
}

const generateUTCDateWithOffset = (date:string | Date | number):Date => {
    const utcDate = new Date(date);
    utcDate.setTime(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
    return utcDate;
}

const parseDateString = (date: string | Date):string => {
    const utcDate = generateUTCDateWithOffset(date); 
    return utcDate.toLocaleDateString();
}

export {
    FeatureFlags,
    isFeatureEnabled,
    generateUTCDateWithOffset,
    parseDateString
}
