import { GlobalUserIDProps } from "@/app";
import { BackgroundColour } from "@/custom_modules/Colours";
import { GetCurrentLocationCoords, LocationHolder, RetrieveRecentPostsFromUser } from "@/custom_modules/HelperFunctions";
import { HomePostHolderProps, HomePostRoot } from "@/custom_modules/PostComponents";
import { useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CreatePostScreen from "../MyEvents/CreatePostScreen";
import EventPostsScreen from "../MyEvents/EventPostsScreen";
import FullEventScreen from "../MyEvents/FullEventScreen";
import FullPostScreen from "../MyEvents/FullPostScreen";

const Stack = createNativeStackNavigator();

function Header() {
    return (
        <View style={styles.header}>
            <Text style={{fontSize:38}}>Home</Text>
        </View>
    );
}

function RootStack(props:GlobalUserIDProps) {
    return (
        <Stack.Navigator initialRouteName="Root">
            <Stack.Screen name="Root" children={() => <HomeScreen userID={props.userID}/>} options= {{headerShown: false}}/>
            <Stack.Screen name="Event Details" children={() => <FullEventScreen userID={props.userID}/>}/>
            <Stack.Screen name="Event Posts" children={() => <EventPostsScreen userID={props.userID}/>}/>
            <Stack.Screen name="Create Post" children={() => <CreatePostScreen userID={props.userID}/>}/>
            <Stack.Screen name="Post Details" children={() => <FullPostScreen userID={props.userID}/>}/>
        </Stack.Navigator>
    )
}

export function HomeScreen(props: GlobalUserIDProps) {
    const [holderData, setHolderData] = useState<HomePostHolderProps[]>([]);
    const [currentLocation, setCurrentLocation] = useState<LocationHolder>(null);

    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            const localHolderData = await RetrieveRecentPostsFromUser(props.userID);
            
            if (localHolderData) {
                setHolderData(localHolderData);
            }

            const currLocation = await GetCurrentLocationCoords();
            if (currLocation) {
                setCurrentLocation(currLocation);
            }
        }

        fetchData();

        return () => {

        }
    }, []));

    if (holderData.length==0) {
        return (
            <View style={styles.container}>
                <Header/>
                <Text>you aint got no events twin</Text>
            </View>
        )
    } else {
        return (
            <View style={styles.container}>
                <Header/>
                <ScrollView>
                    <HomePostRoot holderList={holderData} userLocation={currentLocation}/>
                </ScrollView>
            </View>
        )
    }
}

export default function RootScreen(props: GlobalUserIDProps) {
    return (
        <RootStack userID={props.userID}/>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BackgroundColour,
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20
    }
})