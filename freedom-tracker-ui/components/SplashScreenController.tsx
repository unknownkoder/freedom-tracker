import { SplashScreen } from "expo-router";
import { useGlobalContext } from "@/services/GlobalContext";
import { useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController(){
    const {loading, user, getUserService} = useGlobalContext();
    const {loadUser} = getUserService();

    const initApplication = async () => {
        await AsyncStorage.setItem('initial-boot', 'true');
        loadUser(); 
    }
  
    useEffect(() => {
        if(loading && !user){
            initApplication();
        } 
    }, []);

    if(!loading){
        SplashScreen.hide();
    }

    return null;
}
