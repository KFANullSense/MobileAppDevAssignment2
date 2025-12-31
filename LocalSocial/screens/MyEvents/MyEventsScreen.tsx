import { GlobalUserIDProps } from "@/app";
import { GetJoinedEvents } from "@/components/DBConnect";
import { ConvertEventListToProps } from "@/components/HelperFunctions";
import { EventHolder, EventProps } from "@/components/PostComponents";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CreateEventScreen from "./CreateEventScreen";

const Stack = createNativeStackNavigator();

function Header() {
    return (
        <View style={styles.header}>
            <Text style={{fontSize:38}}>My Events</Text>
        </View>
    );
}

function RootStack(props:GlobalUserIDProps) {
    return (
        <Stack.Navigator initialRouteName="Root">
            <Stack.Screen name="Root" children={() => <MyEventsScreen userID={props.userID}/>} options= {{headerShown: false}}/>
            <Stack.Screen name="Create Event" children={() => <CreateEventScreen userID={props.userID}/>}/>
        </Stack.Navigator>
    )
}

function MyEventsScreen(props: GlobalUserIDProps) {
    const [componentList, setComponentList] = useState<EventProps[]>([]);

    const navigation = useNavigation();

    useFocusEffect(useCallback(() => {
        const fetchEvents = async () => {
            console.log("big things happening over here");

            const eventData = await GetJoinedEvents({userID: props.userID});

            setComponentList(ConvertEventListToProps(eventData));
        }

        fetchEvents();

        return () => {

        }
    }, []));

    return (
        <View style={styles.container}>
            <Header/>
            <ScrollView style={styles.eventHolderContainer}>
                <EventHolder eventList={componentList}/>
            </ScrollView>
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
        alignItems: 'center'
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
    },

    eventHolderContainer: {
        width: '90%',
        marginTop:50
    },

    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20
    }
})