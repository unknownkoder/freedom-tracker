import { Stack } from "expo-router";

export default function PublicRootLayout(){
    return (
        <Stack screenOptions={{ headerShown: false }} />
    )
}
