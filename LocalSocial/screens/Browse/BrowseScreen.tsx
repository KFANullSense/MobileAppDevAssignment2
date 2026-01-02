import { GlobalUserIDProps } from "@/app";
import { BackgroundColour } from "@/custom_modules/Colours";
import { GetNearbyEvents } from "@/custom_modules/DBConnect";
import { ConvertCoordsForSQL, ConvertEventListToProps, ConvertSQLCoordsToNumber, GetCurrentLocationCoords, LocationHolder } from "@/custom_modules/HelperFunctions";
import { EventHolderProps, EventProps } from "@/custom_modules/PostComponents";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import FullEventScreen from "../MyEvents/FullEventScreen";

export function BrowseScreen(props: GlobalUserIDProps) {
    const [localCoords, setLocalCoords] = useState<LocationHolder>({latitude:0, longitude:0});
    const [nearbyEvents, setNearbyEvents] = useState<EventProps[]>([]);
    const mapRef = useRef(null);

    useFocusEffect(useCallback(() => {
        const fetchCoords = async () => {
            const eventData = await GetCurrentLocationCoords();

            console.log(eventData?.latitude, eventData?.longitude);

            if (eventData) {
                console.log("event data", eventData);

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
        <View style={styles.container}>
            <Text style={styles.header}>Browse</Text>
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
        </View>
    )
}

export function EventMarkers(props: EventHolderProps) {
    console.log(props.eventList);

    return (props.eventList.map((localEvent, i) =>
        <Marker
            key={i}
            coordinate={{
                latitude: ConvertSQLCoordsToNumber(localEvent.eventLocation).latitude,
                longitude: ConvertSQLCoordsToNumber(localEvent.eventLocation).longitude
            }}
            title={localEvent.eventName}
            description={localEvent.eventDescription}
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
        fontSize: 32,
        alignSelf:'center',
        textAlign:'center',
        margin:10
    },
    map: {
        width: '100%',
        height:'70%'
    }
})