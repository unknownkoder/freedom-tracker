import { SplashScreen } from "expo-router";
import { useGlobalContext } from "@/services/GlobalContext";
import { useEffect } from "react";

import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController(){
    const mocking = Constants?.expoConfig?.extra?.ENABLE_MOCKS || false;
    const {loading, user, fetchUserFromDatabase} = useGlobalContext();

    const initApplication = async () => {
        await AsyncStorage.setItem('initial-boot', 'true');
        fetchUserFromDatabase(mocking);
    }
  
    useEffect(() => {
        if(loading && !user){
            console.log("~~~ fetch the user at startup ~~~")
            initApplication();
        } 
    }, []);

    if(!loading){
        SplashScreen.hide();
    }

    return null;
}
