import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour, HolderColour } from "@/custom_modules/Colours";
import { DeleteEvent, HasUserJoinedEvent, IsUserHostOfEvent, JoinEvent, LeaveEvent, ReturnFullEvent } from "@/custom_modules/DBConnect";
import { CheckDistance, ConvertEventDetailsToProp, ConvertSQLCoordsToNumber, GetCurrentLocationCoords } from "@/custom_modules/HelperFunctions";
import { EventProps } from "@/custom_modules/PostComponents";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";


export default function FullEventScreen(props: GlobalUserIDProps) {
    const params = useRoute().params;
    const localEventID = params.eventID;

    const [eventDetails, setEventDetails] = useState<EventProps>();
    const [isHost, setIsHost] = useState(false);
    const [withinRange, setWithinRange] = useState(false);
    
    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            const eventData = await ReturnFullEvent({eventID: localEventID});
            const eventProps = ConvertEventDetailsToProp(eventData);
            setEventDetails(eventProps);

            const isHostInfo = await IsUserHostOfEvent({eventID: localEventID, userID: props.userID});
            setIsHost(isHostInfo);

            const currLocation = await GetCurrentLocationCoords();
            const rangeCheck = CheckDistance({startLocation: currLocation, endLocation: ConvertSQLCoordsToNumber(eventProps.eventLocation)});
            setWithinRange(rangeCheck);
        }

        fetchData();

        return () => {

        }
    }, []));

    // useEffect(()  => {
    //     navigation.setOptions({title: eventDetails?.eventName});
    // }, [eventDetails]);
    
    return (
        
        <View style={styles.container}>
            <Text style={styles.header}>{eventDetails?.eventName}</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Image source={{uri:"https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}} style={styles.eventImage} resizeMode="cover"/>
                <View style={styles.eventDatesHolder}>
                    <Text style={styles.eventDatesText}>Start Time: {eventDetails?.startTime}</Text>
                    <Text style={styles.eventDatesText}>End Time: {eventDetails?.endTime}</Text>
                </View>
                <View style={styles.eventInfoBox}>
                    <Text style={styles.eventInfoText}>{eventDetails?.eventDescription}</Text>
                </View>
                <ButtonHolder IsHost={isHost} UserID={props.userID} EventID={localEventID} WithinRange={withinRange}/>
            </ScrollView>
        </View>
    )
}

type ButtonHolderProps = {
    IsHost: boolean;
    EventID: number;
    UserID: number;
    WithinRange: boolean;
}

function ButtonHolder (props: ButtonHolderProps) {
    const navigation = useNavigation();

    const [localHasJoinedEvent, setLocalHasJoinedEvent] = useState(false);
    
    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            const hasJoinedInfo = await HasUserJoinedEvent({eventID: props.EventID, userID: props.UserID});
            setLocalHasJoinedEvent(hasJoinedInfo);
        }

        fetchData();

        return () => {

        }
    }, []));

    async function JoinEventButton() {
        const result = await JoinEvent({eventID: props.EventID, userID: props.UserID});

        if (result) {
            setLocalHasJoinedEvent(true);
        }
    }

    async function LeaveEventButton() {
        const result = await LeaveEvent({eventID: props.EventID, userID: props.UserID});
        if (result) {
            setLocalHasJoinedEvent(false);
        }
    }

    async function DeleteEventButton() {
        await DeleteEvent({eventID: props.EventID, userID: props.UserID});
        navigation.goBack();
    }

    if (localHasJoinedEvent) {
        if (props.IsHost) {
            return (
                <View style={styles.eventButtonHolder}>
                    <Pressable style={styles.eventButtons} onPress={() => {navigation.navigate("Event Posts", {eventID: props.EventID})}}>
                        <Text style={styles.buttonText}>View Posts</Text>
                    </Pressable>
                    <Pressable style={styles.eventButtons} onPress={async() => {DeleteEventButton()}}>
                        <Text style={styles.buttonText}>Delete Event</Text>
                    </Pressable>
                </View>
            )
        } else {
            return (
                <View style={styles.eventButtonHolder}>
                    <Pressable style={styles.eventButtons} onPress={() => {navigation.navigate("Event Posts", {eventID: props.EventID})}}>
                        <Text style={styles.buttonText}>View Posts</Text>
                    </Pressable>
                    <Pressable style={styles.eventButtons}>
                        <Text style={styles.buttonText} onPress={async() => {LeaveEventButton()}}>Leave Event</Text>
                    </Pressable>
                </View>
            )
        }
    } else {
        if (props.WithinRange) {
            return (
                <View style={styles.eventButtonHolder}>
                    <Pressable style={styles.eventButtons}>
                        <Text style={styles.buttonText} onPress={async() => {JoinEventButton()}}>Join Event</Text>
                    </Pressable>
                </View>
            )
        } else {
            return (
                <View style={styles.eventButtonHolder}>
                    <Text>Not close enough to join event.</Text>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: BackgroundColour,
    },

    header: {
        fontSize: 32,
        alignSelf:'center',
        textAlign:'center',
        margin:10
    },

    scrollContainer: {
        alignItems:'center',
        padding:15
    },

    eventImage: {
        borderRadius:5,
        maxHeight:250,
        width:'95%',
        height:'100%',
    },

    eventDatesHolder: {
        width:'95%',
        margin:5,
        justifyContent: 'flex-start'
    },

    eventDatesText: {
        fontSize:16
    },

    eventInfoBox: {
        alignItems:'flex-start',
        justifyContent: 'flex-start',
        width:'100%',
        backgroundColor: HolderColour,
        padding:10,
        borderRadius:10
    },

    eventInfoText: {
        fontSize:14
    },

    eventButtonHolder: {
        margin:15,
    },

    eventButtons: {
        margin:10,
        backgroundColor: ButtonColour,
        padding:15,
        borderRadius:15,
    },

    buttonText: {
        fontSize:24,
        textAlign:'center'
    }
})