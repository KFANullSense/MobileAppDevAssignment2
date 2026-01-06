import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { editButtonStyles } from './CustomStyles';

type ImagePickerProps = {
    updateImageFunc: (newPath: string) => void;
    modalVisible: boolean;
    setModalVisible: (newState: boolean) => void;
}

export function ImagePicker(props: ImagePickerProps) {
    const [localImageURI, setLocalImageURI] = useState("");

    async function PickImage () {
        const permissionResult = await requestMediaLibraryPermissionsAsync();

        if (!permissionResult) {
            console.error("Permission required to access the media library");
            return;
        }

        let result = await launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing:true,
            aspect:[4,3],
            quality:1
        })

        if (!result.canceled) {
            setLocalImageURI(result.assets[0].uri);
        }
    }

    async function ModalUpdateImage() {
        props.setModalVisible(false);
        props.updateImageFunc(localImageURI);
    }

    return (
        <Modal
        visible={props.modalVisible}
        transparent={true}
        onRequestClose={() => props.setModalVisible(false)}>
            <View style={editButtonStyles.modalContainer}>
                <View style={editButtonStyles.modalView}>
                    <UploadPreviewImage imageURL={localImageURI}/>
                    <View style={styles.buttonContainer}>
                        <Pressable style={editButtonStyles.modalButton} onPress={async () => {PickImage();}}>
                            <Text style={styles.buttonText}>Select Image</Text>
                        </Pressable>
                        <Pressable style={editButtonStyles.modalButton} onPress={() => {ModalUpdateImage();}}>
                            <Text style={styles.buttonText}>Submit Image</Text>
                        </Pressable>
                        <Pressable style={editButtonStyles.modalButton} onPress={() => {setLocalImageURI(""); props.setModalVisible(false);}}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

type UploadPreviewImageProps = {
    imageURL: string;
}

function UploadPreviewImage(props: UploadPreviewImageProps) {
    
    if (props.imageURL == "") {
        return (
            <View>

            </View>
        )
    } else {
        return (
            <Image source={{uri:props.imageURL}} style={styles.holderImage} resizeMode="contain"/>
        )
    }
}

type ImagePlaceholdeProps = {
    localImageURI: string;
    setModalVisibleFunc: (newState: boolean) => void;
}

export function ImagePlaceholder(props: ImagePlaceholdeProps) {
    if (props.localImageURI == "") {
        return (
            <Pressable onPress={() => props.setModalVisibleFunc(true)}>
                <Image source={{uri:"https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}} style={styles.holderImage} resizeMode="contain"/>
            </Pressable>
        )
    } else {
        return (
            <Pressable onPress={() => props.setModalVisibleFunc(true)}>
                <Image source={{uri:props.localImageURI}} style={styles.holderImage} resizeMode="cover"/>
            </Pressable>
        )
    }
}

type LoadingModalProps = {
    modalVisible: boolean;
}

export function LoadingModal(props: LoadingModalProps) {
    return (
        <Modal
        visible={props.modalVisible}
        transparent={true}>
            <View style={editButtonStyles.modalContainer}>
                <View style={editButtonStyles.modalView}>
                    <Text style={{fontSize:30, padding:40}}>Uploading...</Text>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    holderImage: {
        borderRadius:15,
        width:250,
        height:175,
        resizeMode:'contain',
        margin:20
    },

    buttonContainer: {

    },

    buttonText: {

    },
});