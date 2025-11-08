import { useGlobalContext } from "@/services/GlobalContext";
import { Stack } from "expo-router"
import { useEffect } from "react"

export default function RootLayout() {

    const { user, loadUserAccountInfo } = useGlobalContext();

    useEffect(() => {
        if(user){
            loadUserAccountInfo()
        }
    }, [])

    return (
        <Stack screenOptions={{ headerShown: false }} />
    )
}
