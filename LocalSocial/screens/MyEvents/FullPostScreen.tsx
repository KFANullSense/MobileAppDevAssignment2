import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour, HolderColour } from "@/custom_modules/Colours";
import { ReturnFullPost } from "@/custom_modules/DBConnect";
import { ConvertPostDetailsToProps } from "@/custom_modules/HelperFunctions";
import { PostProps } from "@/custom_modules/PostComponents";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";


export default function FullPostScreen(props: GlobalUserIDProps) {
    const params = useRoute().params;
    const localPostID = params.postID;

    const [postDetails, setPostDetails] = useState<PostProps>();
    
    useFocusEffect(useCallback(() => {
            const fetchData = async () => {
                const eventData = await ReturnFullPost({postID: localPostID});
                
                if (eventData) {
                    const propData = await ConvertPostDetailsToProps(eventData);

                    setPostDetails(propData);
                }
            }

            fetchData();

            return () => {

            }
        }, []));
    
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.header}>{postDetails?.postTitle}</Text>
                <View style={styles.authorLikesContainer}>
                    <View style={styles.authorContainer}>
                        <Image source={{uri:"https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}} style={styles.authorImage} resizeMode="cover"/>
                        <Text>{postDetails?.authorName}</Text>
                    </View>
                    <Pressable style={styles.likesButton}>
                        
                    </Pressable>
                </View>
                <Image source={{uri:"https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}} style={styles.postImage} resizeMode="cover"/>
                <View style={styles.postBodyContainer}>
                    <Text style={styles.postBodyText}>{postDetails?.postBody}</Text>
                </View>
                <View style={styles.commentContainer}>
                    <Text>
                        Comment num goes here
                    </Text>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {/* dynamic comment thing here */}
                        <View style={styles.commentInputContainer}>
                            <TextInput style={styles.commentTextInput} placeholder={"Enter comment"}/>
                            <Pressable style={styles.postCommentButton}>

                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: BackgroundColour,
    },

    header: {
        fontSize: 32,
        alignSelf:'center',
        textAlign:'center',
        margin:10
    },

    scrollContainer: {
        alignItems:'center',
        padding:15
    },

    postImage: {
        borderRadius:5,
        maxHeight:250,
        width:'95%',
        height:'100%',
    },

    authorLikesContainer: {
        flexDirection:'row',
        width:'95%'
    },

    authorContainer: {
        flexDirection:'row',
        alignItems: 'center',
        backgroundColor: HolderColour,
        padding:10,
        borderRadius:15
    },

    authorImage: {
        width:50,
        height:50, 
        borderRadius:40,
        padding:10
    },
    
    likesButton: {
        
    },

    postBodyContainer: {
        width:'90%'
    },

    postBodyText: {

    },

    commentContainer: {
        width:'100%'
    },

    commentInputContainer: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width:'100%'
    },
    
    commentTextInput: {
        backgroundColor:'#ffffff',
        width:'80%'
    },

    postCommentButton: {
        width:50,
        height:50,
        backgroundColor: ButtonColour
    }
})