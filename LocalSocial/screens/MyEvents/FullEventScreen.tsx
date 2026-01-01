import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { View } from "react-native";

export default function FullEventScreen({route}) {
    useFocusEffect(useCallback(() => {
            console.log(route.params);
    
            return () => {
    
            }
        }, []));
    
    return (
        <View></View>
    )
}