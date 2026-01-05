import { GlobalUserIDProps } from "@/app";
import { BackgroundColour } from "@/custom_modules/CustomStyles";
import { GetFollowingList } from "@/custom_modules/DBConnect";
import { ConvertUserListToProps } from "@/custom_modules/HelperFunctions";
import { BorderLine, FriendHolder, FriendObjectProps } from "@/custom_modules/PostComponents";
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

function RootStack(props:GlobalUserIDProps) {
    return (
        <Stack.Navigator initialRouteName="Root">
            <Stack.Screen name="Root" children={() => <FriendsScreen userID={props.userID}/>} options= {{headerShown: false}}/>
            <Stack.Screen name="Event Details" children={() => <FullEventScreen userID={props.userID}/>}/>
            <Stack.Screen name="Event Posts" children={() => <EventPostsScreen userID={props.userID}/>}/>
            <Stack.Screen name="Create Post" children={() => <CreatePostScreen userID={props.userID}/>}/>
            <Stack.Screen name="Post Details" children={() => <FullPostScreen  userID={props.userID}/>}/>
            <Stack.Screen name="User Details" children={() => <FullProfileScreen userID={props.userID} userProfileID={null}/>}/>
        </Stack.Navigator>
    )
}

export default function RootScreen(props: GlobalUserIDProps) {
    return (
        <RootStack userID={props.userID}/>
    )
}

function FriendsScreen (props: GlobalUserIDProps) {
    const [componentList, setComponentList] = useState<FriendObjectProps[]>([]);


    useFocusEffect(useCallback(() => {
        const fetchUsers = async () => {
            const friendData = await GetFollowingList({userID: props.userID});

            if (friendData) {
                const friendProps = await ConvertUserListToProps({userList: friendData, localUser:props.userID});

                if (friendProps) {setComponentList(friendProps);}
            }
        }

        fetchUsers();

        return () => {

        }
    }, []));

    if (componentList.length == 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Header/>
                <BorderLine/>
                <Text style={styles.noUsersText}>You aren't following any users yet. Go to events to find some!</Text>
            </SafeAreaView>
        )
    } else {
        return (
            <SafeAreaView style={styles.container}>
                <Header/>
                <BorderLine/>
                <ScrollView style={styles.friendHolderContainer}>
                    <FriendHolder friendList={componentList}/>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

function Header() {
    return (
        <View style={styles.header}>
            <Text style={{fontSize:38}}>Followed Users</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BackgroundColour,
        alignItems: 'center'
    },

    friendHolderContainer: {
        width: '90%',
        marginTop:25
    },

    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 25,
        paddingBottom: 20
    },

    noUsersText: {
        textAlign: 'center',
        fontSize: 22,
        marginTop:25
    }
})