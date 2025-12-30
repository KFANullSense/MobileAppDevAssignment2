import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function CreateEventScreen() {
    const [title, setTitle] = React.useState('');
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

    // function ValidateInput(title: string, description: string) {
    //     if (title.length == 0 || description.length == 0) {
    //         console.error("Title and description cannot be empty")
    //     } else {
    //         CreateEvent({eventName: title, eventDescription: description})
    //     }
    // }

    return (
        <View style={styles.container}>
            <View style = {styles.eventCreateHolder}>
                <TextInput style={styles.titleInput} placeholder="Event Title" onChangeText={(value) => setTitle(value)}/>
                <TextInput style={styles.descriptionInput} multiline placeholder="Event Description" onChangeText={(value) => setDescription(value)}/>

                <Pressable onPress={showStartDatePicker} style={styles.dateTimeButton}>
                    <Text>Start Time: {startTime.toString()}</Text>
                </Pressable>
                <DateTimePickerModal isVisible={isStartDatePickerVisible} mode="datetime" onConfirm={confirmStartDatePicker} onCancel={hideStartDatePicker}/>

                <Pressable onPress={showEndDatePicker} style={styles.dateTimeButton}>
                    <Text>End Time: {endTime.toString()}</Text>
                </Pressable>
                <DateTimePickerModal isVisible={isEndDatePickerVisible} mode="datetime" onConfirm={confirmEndDatePicker} onCancel={hideEndDatePicker}/>

            </View>
            <View style={styles.floatingContainer}>
                <Pressable style={styles.createButton}>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#b6dee5ff',
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
        backgroundColor: '#45b6fe',
        width: 75,
        height: 75,
        borderRadius: 50,
    },

    dateTimeButton: {
        backgroundColor: '#45b6fe',
        width:'90%',
        padding:15,
        marginTop: 15
    }
})