import { Image, StyleSheet, Text, View } from "react-native";

export function PostHolder() {
    return (
        <View style={postHolderStyles.holder}>
            <View style={postHolderStyles.title}>
                <Text>Event Name</Text>
            </View>
            <SmallPost/>
            <SmallPost/>
            <SmallPost/>
        </View>
    );
}

export function SmallPost() {
    return (
        <View style={postStyles.container}>
            <View style={postStyles.titleContents}>
                <Image source={{uri:"https://reactnative.dev/img/tiny_logo.png"}} style={postStyles.authorImage} resizeMode="cover"/>
                <View style={postStyles.titleTextBox}>
                    <View style={postStyles.titleTextAlign}>
                        <Text style={postStyles.authorText}>Post Author</Text>
                        <Text style={postStyles.titleText}>Post Title</Text>
                    </View>
                </View>
            </View>
            <View style={postStyles.contents}>
                <Image source={{uri:"https://reactnative.dev/img/tiny_logo.png"}} style={postStyles.contentsImage} resizeMode="cover"/>
                <Text style={postStyles.contentsText}>This is an example of some post contents. Well, herre they are i guess</Text>
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