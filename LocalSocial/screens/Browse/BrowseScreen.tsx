import { GlobalUserIDProps } from "@/app";
import { BackgroundColour } from "@/custom_modules/CustomStyles";
import { GetNearbyEvents } from "@/custom_modules/DBConnect";
import { ConvertCoordsForSQL, ConvertEventListToProps, ConvertSQLCoordsToNumber, GetCurrentLocationCoords, LocationHolder } from "@/custom_modules/HelperFunctions";
import { BorderLine, EventHolderProps, EventProps } from "@/custom_modules/PostComponents";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from "react-native-safe-area-context";
import CreatePostScreen from "../MyEvents/CreatePostScreen";
import EventPostsScreen from "../MyEvents/EventPostsScreen";
import FullEventScreen from "../MyEvents/FullEventScreen";
import FullPostScreen from "../MyEvents/FullPostScreen";
import { FullProfileScreen } from "../Profile/FullProfileScreen";

export function BrowseScreen(props: GlobalUserIDProps) {
    const [localCoords, setLocalCoords] = useState<LocationHolder>({latitude:0, longitude:0});
    const [nearbyEvents, setNearbyEvents] = useState<EventProps[]>([]);
    const mapRef = useRef(null);

    useFocusEffect(useCallback(() => {
        const fetchCoords = async () => {
            const eventData = await GetCurrentLocationCoords();

            setLocalCoords({latitude: eventData.latitude, longitude: eventData.longitude})

            mapRef.current.animateCamera({
                center: {
                    latitude: eventData.latitude,
                    longitude: eventData.longitude
                }
            })

            if (eventData) {
                const nearby = await GetNearbyEvents({location: ConvertCoordsForSQL(eventData)});
                setNearbyEvents(ConvertEventListToProps(nearby));
            } else {
                console.log("no event data");
            }


        }

        fetchCoords();

        return () => {

        }
    }, []));

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Browse</Text>
            <BorderLine/>
            <MapView
                initialRegion={{
                    latitude: localCoords.latitude,
                    longitude: localCoords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0518
                }}
                style={styles.map}
                scrollEnabled={false}
                followsUserLocation={true}
                showsUserLocation={true}
                ref={mapRef}
            >
                <EventMarkers eventList={nearbyEvents}/>
            </MapView>
        </SafeAreaView>
    )
}

export function EventMarkers(props: EventHolderProps) {
    const navigation = useNavigation();

    return (props.eventList.map((localEvent, i) =>
        <Marker
            key={i}
            coordinate={{
                latitude: ConvertSQLCoordsToNumber(localEvent.eventLocation).latitude,
                longitude: ConvertSQLCoordsToNumber(localEvent.eventLocation).longitude
            }}
            title={localEvent.eventName}
            description={localEvent.eventDescription}
            onCalloutPress={() => navigation.navigate("Event Details", {eventID: localEvent.eventID})}
        />)
    )
}

const Stack = createNativeStackNavigator();

function RootStack(props:GlobalUserIDProps) {
    //From my events screen, only joined events will be shown, so joined event is assumed to be true for the full screen props
    
    return (
        <Stack.Navigator initialRouteName="Root">
            <Stack.Screen name="Root" children={() => <BrowseScreen userID={props.userID}/>} options= {{headerShown: false}}/>
            <Stack.Screen name="Event Details" children={() => <FullEventScreen userID={props.userID}/>}/>
            <Stack.Screen name="Event Posts" children={() => <EventPostsScreen userID={props.userID}/>}/>
            <Stack.Screen name="Create Post" children={() => <CreatePostScreen userID={props.userID}/>}/>
            <Stack.Screen name="Post Details" children={() => <FullPostScreen userID={props.userID}/>}/>
            <Stack.Screen name="User Details" children={() => <FullProfileScreen userID={props.userID} userProfileID={null}/>}/>
        </Stack.Navigator>
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
        backgroundColor: BackgroundColour,
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    header: {
        fontSize: 38,
        alignSelf:'center',
        textAlign:'center',
        margin:10,
        paddingTop:15
    },
    map: {
        width: '100%',
        height:'100%',
        marginTop:20
    }
})