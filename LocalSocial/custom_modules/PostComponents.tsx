import { useNavigation } from "@react-navigation/native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { HolderColour } from "./Colours";

type HomePostHolderProps = {
    eventName: string;
    postList: PostProps[];
}


type PostHolderProps = {
    postList: PostProps[];
}

export function HomePostHolder(props: HomePostHolderProps) {
    return (
        <View style={postHolderStyles.holder}>
            <View style={postHolderStyles.title}>
                <Text>props.eventName</Text>
                {props.postList.map((localPost, i) => <PostObject
                    authorName={localPost.authorName}
                    postTitle={localPost.postTitle}
                    postBody={localPost.postBody}
                    authorPictureURL={localPost.authorPictureURL}
                    postMediaURL={localPost.postMediaURL}
                    location={localPost.location}
                    postID={localPost.postID}
                    key={i}
                />)}
            </View>
        </View>
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
}

export function PostObject(props: PostProps) {
    const navigation = useNavigation();

    return (
        <Pressable onPress={() => navigation.navigate("Post Details", {postID: props.postID})}>
            <View style={postStyles.container}>
                <View style={postStyles.titleContents}>
                    <Image source={{uri:"https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}} style={postStyles.authorImage} resizeMode="cover"/>
                    <View style={postStyles.titleTextBox}>
                        <View style={postStyles.titleTextAlign}>
                            <Text style={postStyles.authorText}>{props.authorName}</Text>
                            <Text style={postStyles.titleText}>{props.postTitle}</Text>
                        </View>
                    </View>
                </View>
                <View style={postStyles.contents}>
                    <View style={postStyles.contentImageContainer}>
                        <Image source={{uri:"https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}} style={postStyles.contentsImage} resizeMode="cover"/>
                    </View>
                    <View style={postStyles.contentTextContainer}>
                        <Text style={postStyles.contentsText}>{props.postBody}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    )
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
                        <Image source={{uri:"https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}} style={eventStyles.contentsImage} resizeMode="cover"/>
                    </View>
                    <Text style={eventStyles.contentsText}>{props.eventDescription}</Text>
                </View>
            </View>
        </Pressable>
    )
}

const postHolderStyles = StyleSheet.create({
    holder: {
        backgroundColor: HolderColour,
        alignItems: 'center',
        borderRadius: 10,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        paddingBottom: 20
    },
    title: {
        backgroundColor: '#fff',
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
        height:'auto'
    },
    titleContents: {
        flexDirection:"row",
        alignContent: "space-between",
        alignItems: "flex-start",
        borderRadius:10,
        backgroundColor: '#91c7ceff',
        width:'95%',
        margin:10
    },
    authorImage: {
        width:50,
        height:50, 
        borderRadius:40,
        margin:10
    },
    titleTextBox: {
        margin:5
    },
    titleText: {
        fontSize: 24
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
        flexDirection:"column"
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