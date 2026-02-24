type FeatureFlags = 'EXPO_PUBLIC_RESET_DATABASE' | 'EXPO_PUBLIC_REFETCH_TRANSACTIONS'; 

const isFeatureEnabled = (featureFlag:FeatureFlags) => {
    return process.env[featureFlag] === 'Y';
}

export {
    FeatureFlags,
    isFeatureEnabled
}
