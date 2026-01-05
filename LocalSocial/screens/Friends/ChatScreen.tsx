import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour, HolderColour } from "@/custom_modules/CustomStyles";
import { RetrieveChatMessages, SendChatMessage } from "@/custom_modules/DBConnect";
import { ConvertMessageListToProps } from "@/custom_modules/HelperFunctions";
import { MessageHolder, MessageProps } from "@/custom_modules/PostComponents";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function ChatScreen(props: GlobalUserIDProps) {
    const params = useRoute().params;
    const otherUserID = params.otherUserID;
    
    const [messageList, setMessageList] = useState<MessageProps[]>([]);
    const [newMessageText, setNewMessageText] = useState("");

    const inputRef = useRef(null);

    useEffect(() => {
        const chatRefresh = setInterval(() => {
            FetchMessages();
        }, 3000);

        return () => clearInterval(chatRefresh);
    });

    async function FetchMessages() {
        const messageData = await RetrieveChatMessages({localUserID: props.userID, userToFollowID: otherUserID});

        if (messageData) {
            const propData = await ConvertMessageListToProps(messageData);

            if (propData) {
                setMessageList(propData);
            }
        }
    }

    async function SendMessage() {
        const result = await (SendChatMessage({senderID: props.userID, receiverID: otherUserID, messageText: newMessageText}));
        
        if (result) {
            inputRef.current.clear();
            FetchMessages();
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.messageContainer}>
                <MessageHolder messageList={messageList}/>
            </View>
            <View style={styles.messageInputContainer}>
                <TextInput ref={inputRef} style={styles.messageTextInput} placeholder={"Enter message"} onChangeText={(value) => setNewMessageText(value)}/>
                <Pressable style={styles.sendMessageButton} onPress={async () => {SendMessage()}}>
                    <FontAwesome name="commenting-o" size={25}/>
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

    messageContainer: {
        width:'95%',
        backgroundColor: HolderColour,
        margin:10,
        padding:10,
        borderRadius:10,
        flex:2,
    },
    
    messageInputContainer: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width:'100%',
    },
    
    messageTextInput: {
        backgroundColor:'#ffffff',
        width:'85%',
        padding:15,
        fontSize:18
    },

    sendMessageButton: {
        width:45,
        height:45,
        backgroundColor: ButtonColour,
        borderRadius:25,
        alignItems:'center',
        justifyContent:'center',
    }
})