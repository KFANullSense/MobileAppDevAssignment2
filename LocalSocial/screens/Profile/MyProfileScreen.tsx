import { GlobalUserIDProps } from "@/app";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CreatePostScreen from "../MyEvents/CreatePostScreen";
import EventPostsScreen from "../MyEvents/EventPostsScreen";
import FullEventScreen from "../MyEvents/FullEventScreen";
import FullPostScreen from "../MyEvents/FullPostScreen";
import { FullProfileScreen } from "./FullProfileScreen";

const Stack = createNativeStackNavigator();

function RootStack(props:GlobalUserIDProps) {
    return (
        <Stack.Navigator initialRouteName="Root">
            <Stack.Screen name="Root" children={() => <FullProfileScreen userID={props.userID} userProfileID={props.userID}/>} options= {{headerShown: false}}/>
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