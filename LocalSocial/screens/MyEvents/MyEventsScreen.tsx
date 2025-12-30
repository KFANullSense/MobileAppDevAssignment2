import { GlobalUserIDProps } from "@/app";
import { GetJoinedEvents } from "@/components/DBConnect";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, View } from "react-native";
import CreateEventScreen from "./CreateEventScreen";

const Stack = createNativeStackNavigator();

function RootStack(props:GlobalUserIDProps) {
    return (
        <Stack.Navigator initialRouteName="Root">
            <Stack.Screen name="Root" children={() => <MyEventsScreen userID={props.userID}/>} options= {{headerShown: false}}/>
            <Stack.Screen name="Create Event" children={() => <CreateEventScreen userID={props.userID}/>}/>
        </Stack.Navigator>
    )
}

function MyEventsScreen(props: GlobalUserIDProps) {
    const navigation = useNavigation();

    useFocusEffect(() => {
        const eventData = GetJoinedEvents({userID: props.userID});

        return () => {
            
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.floatingContainer}>
                <Pressable style={styles.createEventButton} onPress={() => navigation.navigate("Create Event")}>
                </Pressable>
            </View>
        </View>
    )
}

export default function RootScreen(props: GlobalUserIDProps) {
    return (
        <RootStack userID={props.userID}/>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#b6dee5ff',
        alignItems: 'center',
        justifyContent: 'center'
    },

    floatingContainer: {
        position: 'absolute',
        bottom:16,
        right:16
    },

    createEventButton: {
        backgroundColor: '#45b6fe',
        width: 75,
        height: 75,
        borderRadius: 50,
    }
})