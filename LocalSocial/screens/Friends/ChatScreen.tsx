import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour, HolderColour } from "@/custom_modules/CustomStyles";
import { RetrieveChatMessages, SendChatMessage } from "@/custom_modules/DBConnect";
import { ConvertMessageListToProps } from "@/custom_modules/HelperFunctions";
import { MessageHolder, MessageProps } from "@/custom_modules/PostComponents";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

export default function ChatScreen(props: GlobalUserIDProps) {
    const params = useRoute().params;
    const otherUserID = params.otherUserID;
    
    const [messageList, setMessageList] = useState<MessageProps[]>([]);
    const [newMessageText, setNewMessageText] = useState("");

    const inputRef = useRef(null);
    const scrollViewRef = useRef(null);

    useFocusEffect(useCallback(() => {
        FetchMessages(true);

        return () => {

        }
    }, []));

    //Refresh the chat messages every 3 seconds
    useEffect(() => {
        const chatRefresh = setInterval(() => {
            FetchMessages();
        }, 3000);

        return () => clearInterval(chatRefresh);
    });

    async function FetchMessages(wasInitialFetch:boolean = false) {
        const messageData = await RetrieveChatMessages({localUserID: props.userID, userToFollowID: otherUserID});

        if (messageData) {
            const propData = await ConvertMessageListToProps({messageDataArray: messageData, localUserID: props.userID, otherUserID: otherUserID});

            if (propData) {
                setMessageList(propData);

                //On first message fetch, wait a moment and scroll to the end of the scrollview (it doesn't get the contentsizechange on initial fetch so has to be done manually)
                if (wasInitialFetch) {
                    await new Promise(res => setTimeout(res, 500));
                    scrollViewRef.current.scrollToEnd({animated:true});
                }
            }
        }    
    }

    async function SendMessage() {
        if (newMessageText == "") {
            Alert.alert("Chat message cannot be empty!");
        } else {
            const result = await (SendChatMessage({senderID: props.userID, receiverID: otherUserID, messageText: newMessageText}));
            
            //If message sent sucecssfully, clear the input box and refresh messages
            if (result) {
                inputRef.current.clear();
                FetchMessages();
            }
        }
    }

    //When the scrollview contents change, scroll to the bottom
    return (
        <View style={styles.container}>
            <View style={styles.messageContainer}>
                <ScrollView ref={scrollViewRef} onContentSizeChange={() => {if (scrollViewRef) {scrollViewRef.current.scrollToEnd({animated:true});}}}>
                    <MessageHolder messageList={messageList}/>
                </ScrollView>
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
        width:'95%',
        margin:10
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