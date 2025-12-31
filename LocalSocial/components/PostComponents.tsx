import { Image, StyleSheet, Text, View } from "react-native";

type PostHolderProps = {
    eventName: string;
    postList: PostProps[];
}

export function PostHolder(props: PostHolderProps) {
    return (
        <View style={postHolderStyles.holder}>
            <View style={postHolderStyles.title}>
                <Text>props.eventName</Text>
                {props.postList.map(localPost => <PostObject
                    authorName={localPost.authorName}
                    postTitle={localPost.postTitle}
                    postBody={localPost.postBody}
                    authorPictureURL={localPost.authorPictureURL}
                    postMediaURL={localPost.postMediaURL}
                ></PostObject>)}
            </View>
        </View>
    );
}

export type PostProps = {
    authorName: string;
    postTitle: string;
    postBody: string;
    authorPictureURL: string;
    postMediaURL: string;
}

export function PostObject(props: PostProps) {
    return (
        <View style={postStyles.container}>
            <View style={postStyles.titleContents}>
                <Image source={{uri:props.authorPictureURL}} style={postStyles.authorImage} resizeMode="cover"/>
                <View style={postStyles.titleTextBox}>
                    <View style={postStyles.titleTextAlign}>
                        <Text style={postStyles.authorText}>{props.authorName}</Text>
                        <Text style={postStyles.titleText}>{props.postTitle}</Text>
                    </View>
                </View>
            </View>
            <View style={postStyles.contents}>
                <Image source={{uri:props.postMediaURL}} style={postStyles.contentsImage} resizeMode="cover"/>
                <Text style={postStyles.contentsText}>{props.postBody}</Text>
            </View>
        </View>
    )
}

type EventHolderProps = {
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
}

export function EventObject(props: EventProps) {
    return (
        <View style={eventStyles.container}>
            <View style={eventStyles.contents}>
                <View style={eventStyles.headerContents}>
                    <View style={eventStyles.leftSideContainer}>
                        <View style={eventStyles.titleContents}>
                            <Text style={eventStyles.titleText}>{props.eventName}</Text>
                            <Text style={eventStyles.contentsText}>Start: {props.startTime}</Text>
                            <Text style={eventStyles.contentsText}>End: {props.endTime}</Text>
                        </View>
                    </View>
                    <View style={eventStyles.rightSideContainer}>
                        <Image source={{uri:"https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}} style={eventStyles.contentsImage} resizeMode="cover"/>
                    </View>
                </View>
                <View style={eventStyles.descriptionContainer}>
                    <Text style={eventStyles.contentsText}>this is a big test of a long description. i need to see what it looks like when im describing things and allat</Text>
                </View>
            </View>
        </View>
    )
}

const postHolderStyles = StyleSheet.create({
    holder: {
        backgroundColor: '#50bbc9ff',
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
        alignItems: 'center',
        backgroundColor: '#b6dee5ff',
        margin:10,
        borderRadius:10,
        width:'95%'
    },
    titleContents: {
        flexDirection:"row",
        alignContent: "space-between",
        alignItems: "flex-start",
        borderRadius:10,
        margin:10,
        width:'95%',
        backgroundColor: '#91c7ceff',
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
        flexDirection:"row",
        alignContent: "space-between",
        alignItems: "flex-start",
        width:'95%',
        marginBottom:10
    },
    titleTextAlign: {
        justifyContent:"center",
        alignItems:"flex-start",
        flexDirection:"column"
    },
    contentsImage: {
        borderRadius:10,
        maxHeight:100,
        maxWidth:125,
        width:'100%',
        height:'100%',
    },
    contentsText: {
        flexShrink:1,
        margin:10
    }
})

const eventHolderStyles = StyleSheet.create({
    holder: {
        backgroundColor: '#50bbc9ff',
        alignItems: 'center',
        
    }
})

const eventStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#50bbc9ff',
        margin:10,
        borderRadius:10,
        width:'95%',
        flex:1,
        paddingBottom: 20,
    },
    titleContents: {
        borderRadius:10,
        margin:10,
        padding:5,
        backgroundColor: '#91c7ceff',
    },
    titleText: {
        fontSize: 16
    },
    headerContents: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    contentsImage: {
        borderRadius:10,
        maxHeight:100,
        maxWidth:125,
        width:'100%',
        height:'100%',
    },
    contentsText: {
        flexShrink:1,
        fontSize: 14
    },
    leftSideContainer: {
        flex:1,
        justifyContent: 'flex-start',
    },
    descriptionContainer: {
        marginLeft: 15,
    },
    rightSideContainer: {
        flex:1,
        justifyContent: 'flex-start',
        margin:10,
        alignItems:'flex-end'
    },
    contents: {
        alignItems:'flex-start'
    }
})