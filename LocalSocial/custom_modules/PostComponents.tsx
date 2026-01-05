import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useNavigation } from "@react-navigation/native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { BackgroundColour, HolderColour, HolderColourDark, HolderColourLight } from "./CustomStyles";
import { LocationHolder } from "./HelperFunctions";

type HomePostRootProps = {
    holderList: HomePostHolderProps[];
}

export type HomePostHolderProps = {
    eventProps: EventProps;
    postList: PostProps[];
    userLocation: LocationHolder;
}


type PostHolderProps = {
    postList: PostProps[];
    userLocation: LocationHolder;
}

export function HomePostRoot(props: HomePostRootProps) {
    return (
        <View>
            {props.holderList.map((localHolder, i) =>
                <HomePostHolder
                eventProps={localHolder.eventProps}
                postList={localHolder.postList}
                userLocation={localHolder.userLocation}
                key={i}
            />)}
        </View>
    )
}

export function HomePostHolder(props: HomePostHolderProps) {
    const navigation = useNavigation();

    return (
        <Pressable onPress={() => navigation.navigate("Event Details", {eventID: props.eventProps.eventID})}>
            <View style={postHolderStyles.holder}>
                <View style={postHolderStyles.title}>
                    <Text>{props.eventProps.eventName}</Text>
                </View>
                {props.postList.map((localPost, i) => <PostObject
                        authorName={localPost.authorName}
                        postTitle={localPost.postTitle}
                        postBody={localPost.postBody}
                        authorPictureURL={localPost.authorPictureURL}
                        postMediaURL={localPost.postMediaURL}
                        location={localPost.location}
                        postID={localPost.postID}
                        userLocation={localPost.userLocation}
                        authorID={localPost.authorID}
                        key={i}
                    />)}
            </View>
        </Pressable>
    );
}

export function PostHolder(props: PostHolderProps) {
    return (
        <View>
            {props.postList.map((localPost, i) => <PostObject
                authorName={localPost.authorName}
                postTitle={localPost.postTitle}
                postBody={localPost.postBody}
                authorPictureURL={localPost.authorPictureURL}
                postMediaURL={localPost.postMediaURL}
                location={localPost.location}
                postID={localPost.postID}
                userLocation={localPost.userLocation}
                authorID={localPost.authorID}
                key={i}
            />)}
        </View>
    );
}

export type PostProps = {
    authorName: string;
    postTitle: string;
    postBody: string;
    authorPictureURL: string;
    postMediaURL: string;
    location: string;
    postID: number;
    userLocation: LocationHolder;
    authorID: number;
}

export function PostObject(props: PostProps) {
    const navigation = useNavigation();

    return (
        <Pressable onPress={() => navigation.navigate("Post Details", {postID: props.postID})}>
            <View style={postStyles.container}>
                <View style={postStyles.titleContents}>
                    <Image source={{uri:props.authorPictureURL}} style={postStyles.authorImage} resizeMode="cover"/>
                    <View style={postStyles.titleTextBox}>
                        <View style={postStyles.titleTextAlign}>
                            <Text style={postStyles.authorText} numberOfLines={1}>{props.authorName}</Text>
                            <Text style={postStyles.titleText} numberOfLines={1}>{props.postTitle}</Text>
                        </View>
                    </View>
                </View>
                <View style={postStyles.contents}>
                    <PostContentImage imageURL={props.postMediaURL}/>
                    <View style={postStyles.contentTextContainer}>
                        <Text style={postStyles.contentsText}>{props.postBody}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

export type ImageURLType = {
    imageURL: string;
}

function PostContentImage(props: ImageURLType) {
    if (props.imageURL == "") {
        return (
            <View>

            </View>
        )
    } else {
        return (
            <View style={postStyles.contentImageContainer}>
                <Image source={{uri:props.imageURL}} style={postStyles.contentsImage} resizeMode="cover"/>
            </View>
        )
    }
}

export type EventHolderProps = {
    eventList: EventProps[]
}

export function EventHolder(props: EventHolderProps) {
    return (
        <View>
            {props.eventList.map((localEvent, i) => <EventObject
                eventName={localEvent.eventName}
                eventDescription={localEvent.eventDescription}
                startTime={localEvent.startTime}
                endTime={localEvent.endTime}
                eventID={localEvent.eventID}
                eventLocation={localEvent.eventLocation}
                eventImageURL={localEvent.eventImageURL}
                key={i}
            />)}
        </View>
    )
}

export type EventProps = {
    eventName: string;
    eventDescription: string;
    startTime: string;
    endTime: string;
    eventID: number;
    eventLocation: string;
    eventImageURL: string;
}

export function EventObject(props: EventProps) {
    const navigation = useNavigation();

    return (
        <Pressable onPress={() => navigation.navigate("Event Details", {eventID: props.eventID})}>
            <View style={eventStyles.container}>
                <View style={eventStyles.contents}>
                    <View style={eventStyles.headerContents}>
                        <View style={eventStyles.titleContents}>
                            <Text style={eventStyles.titleText} numberOfLines={1}>{props.eventName}</Text>
                            <Text style={eventStyles.contentsText}>Start: {props.startTime}</Text>
                            <Text style={eventStyles.contentsText}>End: {props.endTime}</Text>
                        </View>
                        <EventContentImage imageURL={props.eventImageURL}/>
                    </View>
                    <Text style={eventStyles.contentsText}>{props.eventDescription}</Text>
                </View>
            </View>
        </Pressable>
    )
}

function EventContentImage(props: ImageURLType) {
    if (props.imageURL == "") {
        return (
            <View>

            </View>
        )
    } else {
        return (
            <Image source={{uri:props.imageURL}} style={eventStyles.contentsImage} resizeMode="cover"/>
        )
    }
}

export type FriendHolderProps = {
    friendList: FriendObjectProps[];
}

export function FriendHolder (props: FriendHolderProps) {
    return (
        <View>
            {props.friendList.map((localProfile, i) => <FriendObject
                username={localProfile.username}
                profile_picture_url={localProfile.profile_picture_url}
                profileID={localProfile.profileID}
                user_status={localProfile.user_status}
                isMutual={localProfile.isMutual}
                key={i}
            />)}
        </View>
    )
}

export type FriendObjectProps = {
    profileID: number;
    username: string;
    profile_picture_url: string;
    user_status: string;
    isMutual: boolean;
}

export function FriendObject(props: FriendObjectProps) {
    const navigation = useNavigation();

    if (props.isMutual) {
        return (
            <Pressable onPress={() => navigation.navigate("User Details", {userID: props.profileID})}>
                <View style={friendStyles.container}>
                    <View style={friendStyles.infoChatButtonRow}>
                        <View style={friendStyles.userInfoRow}>
                            <Image source={{uri:props.profile_picture_url}} style={friendStyles.profilePicture} resizeMode="cover"/>
                            <View style={friendStyles.textColumn}>
                                <Text style={friendStyles.usernameText}>{props.username}</Text>
                                <Text style={friendStyles.profileStatusText}>{props.user_status}</Text>
                            </View>
                        </View>
                        <Pressable style={friendStyles.chatButton} onPress={() => navigation.navigate("Message User", {otherUserID: props.profileID})}>
                            <MaterialDesignIcons name="message-text-outline" size={30}/>
                        </Pressable>
                    </View>
                </View>
            </Pressable>
        )
    } else {
        return (
            <Pressable onPress={() => navigation.navigate("User Details", {userID: props.profileID})}>
                <View style={friendStyles.container}>
                    <Image source={{uri:props.profile_picture_url}} style={friendStyles.profilePicture} resizeMode="cover"/>
                    <View style={friendStyles.textColumn}>
                        <Text style={friendStyles.usernameText}>{props.username}</Text>
                        <Text style={friendStyles.profileStatusText}>{props.user_status}</Text>
                    </View>
                </View>
            </Pressable>
        )
    }
}

export type CommentHolderProps = {
    commentList: CommentProps[];
}

export function CommentHolder(props: CommentHolderProps) {
    return (
        <View>
            {props.commentList.map((localComment, i) => <CommentObject
                authorName={localComment.authorName}
                authorPictureURL={localComment.authorPictureURL}
                commentText={localComment.commentText}
                key={i}
            />)}
        </View>
    )
}

export type CommentProps = {
    authorName: string;
    authorPictureURL: string;
    commentText: string;
}

export function CommentObject(props: CommentProps) {
    return (
        <View style={commentStyles.container}>
            <View style={commentStyles.contentRow}>
                <Image source={{uri:props.authorPictureURL}} style={commentStyles.authorImage} resizeMode="cover"/>
                <View style={commentStyles.textColumn}>
                    <Text>{props.authorName}</Text>
                    <Text style={commentStyles.commentText}>{props.commentText}</Text>
                </View>
            </View>
        </View>
    )
}

type MessageHolderProps = {
    messageList: MessageProps[];
}

export function MessageHolder(props: MessageHolderProps) {
    return (
        <View>
            {props.messageList.map((localMessage, i) => <MessageObject
                authorName={localMessage.authorName}
                authorPictureURL={localMessage.authorPictureURL}
                messageText={localMessage.messageText}
                key={i}
            />)}
        </View>
    )
}

export type MessageProps = {
    authorName: string;
    authorPictureURL: string;
    messageText: string;
}

export function MessageObject(props: MessageProps) {
    return (
        <View style={commentStyles.container}>
            <View style={commentStyles.contentRow}>
                <Image source={{uri:props.authorPictureURL}} style={commentStyles.authorImage} resizeMode="cover"/>
                <View style={commentStyles.textColumn}>
                    <Text>{props.authorName}</Text>
                    <Text style={commentStyles.commentText}>{props.messageText}</Text>
                </View>
            </View>
        </View>
    )
}

export function BorderLine() {
    return (
        <View style={borderLineStyles.border}/>
    )
}

const borderLineStyles = StyleSheet.create({
    border: {
        borderBottomWidth:2,
        borderBottomColor:'black',
        width:'90%',
        alignSelf:'center',
        marginBottom:5,
        marginTop:5
    }
})

const postHolderStyles = StyleSheet.create({
    holder: {
        backgroundColor: HolderColourDark,
        borderRadius: 10,
        margin:10
    },
    title: {
        backgroundColor: HolderColour,
        marginLeft: 10,
        marginRight:'auto',
        marginTop:10,
        marginBottom:10,
        borderRadius:10,
        padding: 5
    }
})

const postStyles = StyleSheet.create({
    container: {
        backgroundColor: HolderColour,
        margin:10,
        borderRadius:10,
        width:'95%',
        flex:1,
    },
    titleContents: {
        flexDirection:"row",
        alignContent: "space-between",
        alignItems: "flex-start",
        borderRadius:10,
        backgroundColor: '#91c7ceff',
        width:'95%',
        margin:10,
    },
    authorImage: {
        width:50,
        height:50, 
        borderRadius:40,
        margin:10
    },
    titleTextBox: {
        margin:5,
        flexShrink:1
    },
    titleText: {
        fontSize: 22,
    },
    authorText: {

    },
    contents: {
        flexDirection:'row',
        width:'95%',
        margin:10,
    },
    titleTextAlign: {
        justifyContent:"center",
        alignItems:"flex-start",
        flexDirection:"column",
    },
    contentsImage: {
        width: undefined,
        height: undefined,
        borderRadius:15,
        flex:1
    },
    contentsText: {
        marginLeft: 10
    },
    contentImageContainer: {
        width:125,
        height:100,
    },
    contentTextContainer: {
        
    }
})

const eventStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#50bbc9ff',
        margin:10,
        padding:10,
        borderRadius:10,
        flex:1,
        width:'95%',
    },
    titleContents: {
        borderRadius:10,
        padding:5,
        backgroundColor: '#91c7ceff',
        flexShrink:1,
        marginRight:10
    },
    titleText: {
        fontSize: 16,
    },
    headerContents: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width:'100%',
        marginBottom:5
    },
    contentsImage: {
        borderRadius:10,
        maxHeight:100,
        maxWidth:125,
        width:'100%',
        height:'100%',
    },
    contentsText: {
        fontSize: 14,
    },
    contents: {
        
    }
})

const commentStyles = StyleSheet.create({
    container: {
        backgroundColor:BackgroundColour,
        margin:5,
        borderRadius:10,
    },
    authorName: {
        marginLeft:5,
        marginTop:5
    },
    contentRow: {
        flexDirection: 'row',
    },
    commentText: {
        
    },
    authorImage: {
        width:30,
        height:30, 
        borderRadius:40,
        margin:10
    },
    textColumn: {

    }
})

const friendStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: HolderColour,
        margin:10,
        padding:10,
        borderRadius:10,
        flex:1,
        width:'95%',
        flexDirection:'row',
        justifyContent:'space-between'
    },
    profilePicture: {
        width:50,
        height:50, 
        borderRadius:40,
        margin:10
    },
    usernameText: {
        fontSize:22
    },
    profileStatusText: {
        marginTop:5
    },
    textColumn: {
        flexDirection:'column',
        justifyContent:'center'
    },
    chatButton: {
        width:50,
        height:50,
        backgroundColor: HolderColourLight,
        borderRadius:100,
        alignItems:'center',
        justifyContent:'center',
    },
    infoChatButtonRow: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        flex:1
    },
    userInfoRow: {
        flexDirection:'row'
    }
})