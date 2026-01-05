import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour } from "@/custom_modules/CustomStyles";
import { CreateEvent } from "@/custom_modules/DBConnect";
import { ConvertDateTimeForSQL, GetCurrentLocationForSQL } from "@/custom_modules/HelperFunctions";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function CreateEventScreen(props: GlobalUserIDProps) {
    const navigation = useNavigation();

    const [title, setTitle] = useState('');
    const [description, setDescription] = React.useState('');
    const [startTime, setStartTime] = React.useState(new Date());
    const [endTime, setEndTime] = React.useState(new Date);

    const [isStartDatePickerVisible, setStartDatePickerVisible] = React.useState(false);

    const showStartDatePicker = () => { setStartDatePickerVisible(true); }
    const hideStartDatePicker = () => { setStartDatePickerVisible(false); }
    const confirmStartDatePicker = (value) => { setStartTime(value); hideStartDatePicker();}

    const [isEndDatePickerVisible, setEndDatePickerVisible] = React.useState(false);

    const showEndDatePicker = () => { setEndDatePickerVisible(true); }
    const hideEndDatePicker = () => { setEndDatePickerVisible(false); }
    const confirmEndDatePicker = (value) => { setEndTime(value); hideEndDatePicker();}

    async function ValidateInput() {
        if (title.length == 0 || description.length == 0) {
            console.error("Title and description cannot be empty")
        } else {
            if (title.length <= 2) {
                console.error("Title must be at least 3 characters long!");
            } else {
                if (endTime <= startTime) {
                    console.error("End time cannot be before or equal to start time");
                } else {
                    const locationValue = await GetCurrentLocationForSQL();

                    if (locationValue == "") {
                        console.error("Error while fetching location");
                    } else {
                        const result = await CreateEvent({eventName: title, eventDescription: description, positionString: locationValue, eventStartTime: ConvertDateTimeForSQL(startTime), eventEndTime: ConvertDateTimeForSQL(endTime), userID: props.userID})

                        if (result == true) {
                            navigation.goBack();
                        }
                    }
                }
            }
        }
    }

    return (
        <View style={styles.container}>
            <View style = {styles.eventCreateHolder}>
                <TextInput style={styles.titleInput} placeholder="Event Title" onChangeText={(value) => setTitle(value)}/>
                <TextInput style={styles.descriptionInput} multiline placeholder="Event Description" onChangeText={(value) => setDescription(value)}/>

                <Pressable onPress={showStartDatePicker} style={styles.dateTimeButton}>
                    <Text>Start Time: {ConvertDateTimeForSQL(startTime)}</Text>
                </Pressable>
                <DateTimePickerModal isVisible={isStartDatePickerVisible} mode="datetime" onConfirm={confirmStartDatePicker} onCancel={hideStartDatePicker}/>

                <Pressable onPress={showEndDatePicker} style={styles.dateTimeButton}>
                    <Text>End Time: {ConvertDateTimeForSQL(endTime)}</Text>
                </Pressable>
                <DateTimePickerModal isVisible={isEndDatePickerVisible} mode="datetime" onConfirm={confirmEndDatePicker} onCancel={hideEndDatePicker}/>
            </View>
            <View style={styles.floatingContainer}> 
                <Pressable style={styles.createButton} onPress={async() => ValidateInput()}>
                    <FontAwesome style={{marginRight:5}}name="send-o" size={35}/>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BackgroundColour,
        alignItems: 'center'
    },

    eventCreateHolder: {
        width:'100%',
        alignItems:'center'
    },

    titleInput: {
        backgroundColor:'#ffff',
        width:'90%',
        marginTop:15
    },

    descriptionInput: {
        backgroundColor:'#ffff',
        width:'90%',
        height:150,
        marginTop:15,
        textAlignVertical:'top'
    },

    floatingContainer: {
        position: 'absolute',
        bottom:16,
        right:16
    },

    createButton: {
        backgroundColor: ButtonColour,
        width: 75,
        height: 75,
        borderRadius: 50,
        justifyContent:'center',
        alignItems:'center'
    },

    dateTimeButton: {
        backgroundColor: ButtonColour,
        width:'90%',
        padding:15,
        marginTop: 15
    }
})