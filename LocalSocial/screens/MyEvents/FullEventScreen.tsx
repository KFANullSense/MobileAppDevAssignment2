import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour, editButtonStyles, HolderColour } from "@/custom_modules/CustomStyles";
import { DeleteEvent, HasUserJoinedEvent, IsUserHostOfEvent, JoinEvent, LeaveEvent, ReturnFullEvent, UpdateEventDescription, UpdateEventName } from "@/custom_modules/DBConnect";
import { CheckDistance, ConvertEventDetailsToProp, ConvertSQLCoordsToNumber, GetCurrentLocationCoords } from "@/custom_modules/HelperFunctions";
import { BorderLine, EventProps, ImageURLType } from "@/custom_modules/PostComponents";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { Alert, Image, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";


export default function FullEventScreen(props: GlobalUserIDProps) {
    const params = useRoute().params;
    const localEventID = params.eventID;

    const [eventDetails, setEventDetails] = useState<EventProps>({eventName: "Loading...", eventDescription: "Loading...", eventID: -1, eventLocation: "", startTime: "", endTime: "", eventImageURL:""});
    const [isHost, setIsHost] = useState(false);
    const [withinRange, setWithinRange] = useState(false);
    
    //Check event details, whether user is host and whether user is in range to interact
    async function FetchData() {
            const eventData = await ReturnFullEvent({eventID: localEventID});
            const eventProps = ConvertEventDetailsToProp(eventData);
            setEventDetails(eventProps);

            const isHostInfo = await IsUserHostOfEvent({eventID: localEventID, userID: props.userID});
            setIsHost(isHostInfo);

            const currLocation = await GetCurrentLocationCoords();
            const rangeCheck = CheckDistance({startLocation: currLocation, endLocation: ConvertSQLCoordsToNumber(eventProps.eventLocation)});
            setWithinRange(rangeCheck);
    } 

    useFocusEffect(useCallback(() => {
        FetchData();

        return () => {

        }
    }, []));
    
    return (
        
        <View style={styles.container}>
            <EventNameDisplay eventID={localEventID} isOwner={isHost} eventData={eventDetails} successFunction={FetchData}/>
            <BorderLine/>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <ContentImage imageURL={eventDetails.eventImageURL}/>
                <View style={styles.eventDatesHolder}>
                    <Text style={styles.eventDatesText}>Start Time: {eventDetails?.startTime}</Text>
                    <Text style={styles.eventDatesText}>End Time: {eventDetails?.endTime}</Text>
                </View>
                <View style={styles.eventInfoBox}>
                    <EventDescriptionDisplay eventID={localEventID} isOwner={isHost} eventData={eventDetails} successFunction={FetchData}/>
                </View>
                <ButtonHolder IsHost={isHost} UserID={props.userID} EventID={localEventID} WithinRange={withinRange}/>
            </ScrollView>
        </View>
    )
}

function ContentImage(props: ImageURLType) {
    if (props.imageURL == "") {
        return <View></View>
    } else {
        return (
            <Image source={{uri:props.imageURL}} style={styles.eventImage} resizeMode="contain"/>
        )
    }
}

type EventEditModalProps = {
    eventID: number;
    isOwner: boolean;
    eventData: EventProps;
    successFunction: Function;
}

//If the user is hosting, allow them to change the event name
function EventNameDisplay (props: EventEditModalProps) { 
    const [modalVisible, setModalVisible] = useState(false);
    const [eventNameString, setEventNameString] = useState("");
    
    const eventNameInputRef = useRef(null);
    
    function OpenModal() {
        setEventNameString(props.eventData.eventName);
        setModalVisible(true);
    }

    async function ModalUpdateEventName() {
        if (eventNameString.length <= 2) {
            Alert.alert("Event name must be at least three characters long!");
            return;
        }

        const result = await UpdateEventName({eventID: props.eventID, newString: eventNameString});

        if (result) {
            props.successFunction();
            setModalVisible(false);
            setEventNameString("");
        }   
    }

    if (props.isOwner) {
        return (
            <View style={styles.header}>
                <View style={editButtonStyles.editRow}>
                    <Modal
                    visible={modalVisible}
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}>
                        <View style={editButtonStyles.modalContainer}>
                            <View style={editButtonStyles.modalView}>
                                <TextInput style={editButtonStyles.modalTextInput} ref={eventNameInputRef} placeholder="Enter new event name..." onChangeText={(value) => setEventNameString(value)} value={eventNameString}/>
                                <Pressable style={editButtonStyles.modalButton} onPress={async () => {ModalUpdateEventName()}}>
                                    <Text>Update Event Name</Text>
                                </Pressable>
                                <Pressable style={editButtonStyles.modalButton} onPress={() => {setModalVisible(false)}}>
                                    <Text>Cancel</Text>
                                </Pressable>
                            </View>
                            </View>
                    </Modal>

                    <Text style={styles.eventNameText}>{props.eventData.eventName}</Text>
                    <Pressable style={editButtonStyles.editButton} onPress={() => OpenModal()}>
                        <FontAwesome5 name="edit" size={25}/>
                    </Pressable>
                </View>
            </View>
        )
    } else {
        return (
            <View style={styles.header}>
                <Text style={styles.eventNameText}>{props.eventData.eventName}</Text>
            </View>
        )
    }
}

//If user is host, allow them to change event description
function EventDescriptionDisplay(props: EventEditModalProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [eventDescriptionString, setEventDescriptionString] = useState("");
    
    const eventDescriptionInputRef = useRef(null);
    
    function OpenModal() {
        setEventDescriptionString(props.eventData.eventDescription);
        setModalVisible(true);
    }

    async function ModalUpdateEventDescription() {
        if (eventDescriptionString.length == 0) {
            Alert.alert("Event description cannot be empty!");
            return;
        }

        const result = await UpdateEventDescription({eventID: props.eventID, newString: eventDescriptionString});

        if (result) {
            props.successFunction();
            setModalVisible(false);
            setEventDescriptionString("");
        }
    }

    if (props.isOwner) {
        return (
            <View style={editButtonStyles.editRow}>
                <Modal
                visible={modalVisible}
                transparent={true}
                onRequestClose={() => setModalVisible(false)}>
                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                        <View style={editButtonStyles.modalContainer}>
                            <View style={editButtonStyles.modalView}>
                                <TextInput style={editButtonStyles.modalTextInput} ref={eventDescriptionInputRef} placeholder="Enter new event description..." onChangeText={(value) => setEventDescriptionString(value)}/>
                                <Pressable style={editButtonStyles.modalButton} onPress={async () => {ModalUpdateEventDescription()}}>
                                    <Text>Update Event Description</Text>
                                </Pressable>
                                <Pressable style={editButtonStyles.modalButton} onPress={() => {setModalVisible(false)}}>
                                    <Text>Cancel</Text>
                                </Pressable>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <Text style={styles.eventInfoText}>{props.eventData.eventDescription}</Text>
                <Pressable style={editButtonStyles.editButton} onPress={() => OpenModal()}>
                    <FontAwesome5 name="edit" size={25}/>
                </Pressable>
            </View>
        )
    } else {
        return (
            <View>
                <Text style={styles.eventInfoText}>{props.eventData.eventDescription}</Text>
            </View>
        )
    }
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

    //If host, show posts and delete, if joined, show view and leave, if not joined, show join
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
        alignSelf:'center',
        textAlign:'center',
        margin:10,
        paddingTop:25
    },

    eventNameText: {
        fontSize: 24
    },

    scrollContainer: {
        alignItems:'center',
        padding:15
    },

    eventImage: {
        borderRadius:15,
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