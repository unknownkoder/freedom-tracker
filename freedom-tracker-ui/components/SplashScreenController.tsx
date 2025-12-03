import { SplashScreen } from "expo-router";
import { useGlobalContext } from "@/services/GlobalContext";
import { useEffect } from "react";

import Constants from "expo-constants";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController(){
    const mocking = Constants?.expoConfig?.extra?.ENABLE_MOCKS || false;
    const {loading, user, fetchUserFromDatabase} = useGlobalContext();
  
    useEffect(() => {
        if(loading && !user){
            fetchUserFromDatabase(mocking);
        } 
    }, []);

    if(!loading){
        SplashScreen.hide();
    }

    return null;
}
