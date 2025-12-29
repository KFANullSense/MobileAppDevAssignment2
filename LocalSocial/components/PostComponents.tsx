import { Image, StyleSheet, Text, View } from "react-native";

type HolderProps = {
    eventName: string;
    postList: PostProps[];
}

export function PostHolder(props: HolderProps) {
    const transformedPosts = props.postList.map(localPost => <PostObject
            authorName={localPost.authorName}
            postTitle={localPost.postTitle}
            postBody={localPost.postBody}
            authorPictureURL={localPost.authorPictureURL}
            postMediaURL={localPost.postMediaURL}
        ></PostObject>)
    
    return (
        <View style={postHolderStyles.holder}>
            <View style={postHolderStyles.title}>
                <Text>props.eventName</Text>
                <ul>{transformedPosts}</ul>
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
                        <Text style={postStyles.authorText}>props.authorName</Text>
                        <Text style={postStyles.titleText}>props.postTitle</Text>
                    </View>
                </View>
            </View>
            <View style={postStyles.contents}>
                <Image source={{uri:props.postMediaURL}} style={postStyles.contentsImage} resizeMode="cover"/>
                <Text style={postStyles.contentsText}>props.postBody</Text>
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