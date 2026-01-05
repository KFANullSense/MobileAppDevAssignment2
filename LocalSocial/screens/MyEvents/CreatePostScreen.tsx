import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour } from "@/custom_modules/CustomStyles";
import { CreatePost, UploadImage } from "@/custom_modules/DBConnect";
import { GetCurrentLocationForSQL } from "@/custom_modules/HelperFunctions";
import { ImagePicker, ImagePlaceholder } from "@/custom_modules/ImagePickerModal";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function CreatePostScreen(props: GlobalUserIDProps) {
    const navigation = useNavigation();

    const params = useRoute().params;
    const localEventID = params.eventID;

    const [title, setTitle] = useState("");
    const [body, setBody] = React.useState("");
    const [localImage, setLocalImage] = useState("");

    const [modalVisible, setModalVisible] = useState(false);

    async function ValidateInput() {
        if (title.length == 0 || body.length == 0) {
            console.error("Title and body cannot be empty")
        } else {
            const locationValue = await GetCurrentLocationForSQL();

            if (locationValue == "") {
                console.error("Error while fetching location");
            } else {
                const currLocation = await GetCurrentLocationForSQL();
                var currImage = "";
                var imageSuccess = true;
                
                if (localImage != "") {
                    imageSuccess = false;

                    const imagePath = await UploadImage({userID: props.userID, imageURI: localImage});

                    if (imagePath) {
                        currImage = imagePath;
                        imageSuccess = true;
                    }
                }

                if (imageSuccess == true) {
                    const result = await CreatePost({postTitle: title, postBody: body, postImageUrl: currImage, eventID: localEventID, authorID: props.userID, location: currLocation})

                    if (result == true) {
                        navigation.goBack();
                    }
                }
            }
        }
    }

    return (
        <View style={styles.container}>
            <ImagePicker modalVisible={modalVisible} setModalVisible={setModalVisible} updateImageFunc={setLocalImage}/>

            <View style = {styles.eventCreateHolder}>
                <TextInput style={styles.titleInput} placeholder="Post Title" onChangeText={(value) => setTitle(value)}/>
                    <ImagePlaceholder localImageURI={localImage} setModalVisibleFunc={setModalVisible}/>
                <TextInput style={styles.descriptionInput} multiline placeholder="Post Contents" onChangeText={(value) => setBody(value)}/>
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
    }
})