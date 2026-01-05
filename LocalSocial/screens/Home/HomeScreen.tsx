import { GlobalUserIDProps } from "@/app";
import { BackgroundColour } from "@/custom_modules/CustomStyles";
import { RetrieveRecentPostsForUser } from "@/custom_modules/HelperFunctions";
import { BorderLine, HomePostHolderProps, HomePostRoot } from "@/custom_modules/PostComponents";
import { useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CreatePostScreen from "../MyEvents/CreatePostScreen";
import EventPostsScreen from "../MyEvents/EventPostsScreen";
import FullEventScreen from "../MyEvents/FullEventScreen";
import FullPostScreen from "../MyEvents/FullPostScreen";
import { FullProfileScreen } from "../Profile/FullProfileScreen";

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
            <Stack.Screen name="User Details" children={() => <FullProfileScreen userID={props.userID} userProfileID={null}/>}/>
        </Stack.Navigator>
    )
}

export function HomeScreen(props: GlobalUserIDProps) {
    const [holderData, setHolderData] = useState<HomePostHolderProps[]>([]);

    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            const localHolderData = await RetrieveRecentPostsForUser(props.userID);
            
            if (localHolderData) {
                setHolderData(localHolderData);
            }
        }

        fetchData();

        return () => {

        }
    }, []));

    if (holderData.length==0) {
        return (
            <SafeAreaView style={styles.container}>
                <Header/>
                <BorderLine/>
                <Text style={styles.noEventText}>You aren't in any events, or joined events have no posts! Go to Browse to find events nearby, and my events to view and post in events you have joined.</Text>
            </SafeAreaView>
        )
    } else {
        return (
            <SafeAreaView style={styles.container}>
                <Header/>
                <BorderLine/>
                <ScrollView>
                    <HomePostRoot holderList={holderData}/>
                </ScrollView>
            </SafeAreaView>
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
        alignSelf: 'center',
        alignItems:'center',
        paddingTop: 25,
        paddingBottom: 15,
    },
    noEventText: {
        textAlign: 'center',
        fontSize: 22,
        marginTop:25
    }
})