import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour, HolderColour } from "@/custom_modules/Colours";
import { CreateComment, HasUserLikedPost, LikePost, ReturnFullPost, ReturnPostComments, ReturnPostLikes, UnlikePost } from "@/custom_modules/DBConnect";
import { ConvertCommentListToProps, ConvertPostDetailsToProps } from "@/custom_modules/HelperFunctions";
import { CommentHolder, CommentProps, PostProps } from "@/custom_modules/PostComponents";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";


export default function FullPostScreen(props: GlobalUserIDProps) {
    const params = useRoute().params;
    const localPostID = params.postID;

    const [postDetails, setPostDetails] = useState<PostProps>();
    const [newCommentText, setNewCommentText] = useState("");
    const [commentList, setCommentList] = useState<CommentProps[]>([]);

    const commentRef = useRef(null);
    
    async function PostComment() {
        const result = await (CreateComment({postID: localPostID, userID: props.userID, commentText: newCommentText}));

        if (result) {
            commentRef.current.clear();
            FetchComments();
        }
    }

    async function FetchComments() {
        const commentData = await ReturnPostComments({postID: localPostID});

        if (commentData) {
            const propData = await ConvertCommentListToProps(commentData);

            if (propData) {
                setCommentList(propData);
            }
        }
    }

    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            const postData = await ReturnFullPost({postID: localPostID});
            
            if (postData) {
                const propData = await ConvertPostDetailsToProps(postData);

                setPostDetails(propData);
            }
        }

        fetchData();
        FetchComments();

        return () => {

        }
    }, []));
    
    return (
        <View style={styles.container}>
            <Text style={styles.header}>{postDetails?.postTitle}</Text>
            <View style={styles.scrollViewHolder}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.authorLikesContainer}>
                        <View style={styles.authorContainer}>
                            <Image source={{uri:"https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}} style={styles.authorImage} resizeMode="cover"/>
                            <Text style={styles.authorText}>{postDetails?.authorName}</Text>
                        </View>
                        <LikeButton postID={localPostID} userID={props.userID}/>
                    </View>
                    <Image source={{uri:"https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}} style={styles.postImage} resizeMode="cover"/>
                    <View style={styles.postBodyContainer}>
                        <Text style={styles.postBodyText}>{postDetails?.postBody}</Text>
                    </View>
                </ScrollView>
            </View>
            <View style={styles.commentContainer}>
                <Text>{commentList?.length} Comments</Text>
                <ScrollView>
                    <CommentHolder commentList={commentList}/>
                </ScrollView>
                    <View style={styles.commentInputContainer}>
                        <TextInput ref={commentRef} style={styles.commentTextInput} placeholder={"Enter comment"} onChangeText={(value) => setNewCommentText(value)}/>
                        <Pressable style={styles.postCommentButton} onPress={async () => {PostComment()}}>
                            <FontAwesome name="commenting-o" size={25}/>
                        </Pressable>
                </View>
            </View>
        </View>
        
    )
}

type LikeButtonProps = {
    userID: number;
    postID: number;
}

function LikeButton(props: LikeButtonProps) {
    const [hasLiked, setHasLiked] = useState(false);
    const [postLikes, setPostLikes] = useState(0);

    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            const hasLikedData = await HasUserLikedPost({postID: props.postID, userID: props.userID});
            
            setHasLiked(hasLikedData);
        }

        fetchData();
        FetchLikes();

        return () => {

        }
    }, []));

    async function FetchLikes () {
        const postLikesData = await ReturnPostLikes({postID: props.postID});

        if (postLikesData) {
            setPostLikes(postLikesData);
        }
    }

    async function LikePostPress() {
        const result = await LikePost({postID: props.postID, userID: props.userID});

        if (result) {
            setHasLiked(true);
            await FetchLikes();
        }
    }

    async function UnlikePostPress() {
        const result = await UnlikePost({postID: props.postID, userID: props.userID});

        if (result) {
            setHasLiked(false);
            await FetchLikes();
        }
    }

    if (!hasLiked) {
        return (
            <Pressable style={styles.likesButton} onPress={async() => {LikePostPress()}}>
                <FontAwesome name={"heart-o"} size={30}/>
                <Text style={styles.likesText}>{postLikes}</Text>
            </Pressable>
        )
    } else {
        return (
            <Pressable style={styles.likesButton} onPress={async() => {UnlikePostPress()}}>
                <FontAwesome name={"heart"} size={30}/>
                <Text style={styles.likesText}>{postLikes}</Text>
            </Pressable>
        )
    }
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

    scrollViewHolder: {
        flex:5
    },

    scrollContainer: {
        alignItems:'center',
        flex:1
    },

    postImage: {
        borderRadius:5,
        maxHeight:250,
        width:'95%',
        height:'100%',
    },

    authorLikesContainer: {
        flexDirection:'row',
        width:'95%',
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom:10
    },

    authorContainer: {
        flexDirection:'row',
        alignItems: 'center',
        backgroundColor: HolderColour,
        padding:10,
        borderRadius:15,
        flex:10,
        marginRight:20
    },

    authorImage: {
        width:50,
        height:50, 
        borderRadius:40,
        padding:10
    },

    authorText: {
        fontSize: 18,
        marginLeft:10
    },
    
    likesButton: {
        backgroundColor: ButtonColour,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        padding:15,
        borderRadius:10
    },

    likesText: {
        fontSize:18,
        marginLeft:10
    },

    postBodyContainer: {
        width:'95%',
        backgroundColor: HolderColour,
        marginTop:10,
        padding:10,
        borderRadius:10
    },

    postBodyText: {

    },

    commentContainer: {
        width:'95%',
        backgroundColor: HolderColour,
        margin:10,
        padding:10,
        borderRadius:10,
        flex:2,
    },

    commentInputContainer: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width:'100%',
    },
    
    commentTextInput: {
        backgroundColor:'#ffffff',
        width:'85%',
    },

    postCommentButton: {
        width:45,
        height:45,
        backgroundColor: ButtonColour,
        borderRadius:25,
        alignItems:'center',
        justifyContent:'center',
    }
})