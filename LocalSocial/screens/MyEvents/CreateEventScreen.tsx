import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour } from "@/custom_modules/CustomStyles";
import { CreateEvent, UploadImage } from "@/custom_modules/DBConnect";
import { ConvertDateTimeForSQL, GetCurrentLocationForSQL } from "@/custom_modules/HelperFunctions";
import { ImagePicker, ImagePlaceholder, LoadingModal } from "@/custom_modules/ImagePickerModal";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
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

    const [localImage, setLocalImage] = useState("");
    
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [loadingModalVisible, setLoadingModalVisible] = useState(false);

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
                        var currImage = "";
                        var imageSuccess = true;

                        if (localImage != "") {
                            imageSuccess = false;
                            
                            setLoadingModalVisible(true);
                            const imagePath = await UploadImage({userID: props.userID, imageURI: localImage});
                            setLoadingModalVisible(false);
        
                            if (imagePath) {
                                currImage = imagePath;
                                imageSuccess = true;
                            }
                        }
        
                        if (imageSuccess == true) {
                            const result = await CreateEvent({eventName: title, eventDescription: description, positionString: locationValue, eventStartTime: ConvertDateTimeForSQL(startTime), eventEndTime: ConvertDateTimeForSQL(endTime), userID: props.userID, eventImageURL: currImage})
        
                            if (result == true) {
                                navigation.goBack();
                            }
                        }
                    }
                }
            }
        }
    }

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style = {styles.eventCreateHolder}>
                    <LoadingModal modalVisible={loadingModalVisible}/>
                    <ImagePicker modalVisible={imageModalVisible} setModalVisible={setImageModalVisible} updateImageFunc={setLocalImage}/>

                    <TextInput style={styles.titleInput} placeholder="Event Title" onChangeText={(value) => setTitle(value)}/>
                    <ImagePlaceholder localImageURI={localImage} setModalVisibleFunc={setImageModalVisible}/>
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
            </TouchableWithoutFeedback>
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
        marginTop:40,
        padding:15,
        fontSize:18
    },

    descriptionInput: {
        backgroundColor:'#ffff',
        width:'90%',
        height:150,
        textAlignVertical:'top',
        padding:15,
        fontSize:18
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