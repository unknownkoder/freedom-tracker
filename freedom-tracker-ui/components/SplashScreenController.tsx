import { SplashScreen } from "expo-router";
import { useGlobalContext } from "@/services/GlobalContext";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController(){
    const {loading, user, fetchUserFromDatabase} = useGlobalContext();

    useEffect(() => {
        if(loading && !user){
            fetchUserFromDatabase();
        }
    }, []);

    if(!loading){
        SplashScreen.hide();
    }

    return null;
}
