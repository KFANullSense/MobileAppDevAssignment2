import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour, HolderColour, TooFarButtonColour } from "@/custom_modules/CustomStyles";
import { CreateComment, defaultProfilePictureURL, HasUserLikedPost, LikePost, ReturnFullPost, ReturnPostComments, ReturnPostLikes, UnlikePost } from "@/custom_modules/DBConnect";
import { CheckDistance, ConvertCommentListToProps, ConvertPostDetailsToProps, ConvertSQLCoordsToNumber } from "@/custom_modules/HelperFunctions";
import { CommentHolder, CommentProps, ImageURLType, PostProps } from "@/custom_modules/PostComponents";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { Alert, Image, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";


export default function FullPostScreen(props: GlobalUserIDProps) {
    const navigation = useNavigation();

    const params = useRoute().params;
    const localPostID = params.postID;

    const [postDetails, setPostDetails] = useState<PostProps>({postBody: "Loading...", postID: -1, postMediaURL: "", postTitle: "Loading...", authorID: -1, authorName:"Loading...", authorPictureURL: defaultProfilePictureURL, userLocation: {longitude:0, latitude:0}, location: ""});
    const [commentList, setCommentList] = useState<CommentProps[]>([]);

    const [withinRange, setWithinRange] = useState(false);

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

                setWithinRange(CheckDistance({startLocation: propData.userLocation, endLocation: ConvertSQLCoordsToNumber(propData.location)}));
            }
        }

        fetchData();
        FetchComments();

        return () => {

        }
    }, []));
    
    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
                <Text style={styles.header}>{postDetails?.postTitle}</Text>
                <View style={styles.scrollViewHolder}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <AuthorContainer localPostID={localPostID} localUserID={props.userID} withinRange={withinRange} postDetails={postDetails}/>
                        <ContentImage imageURL={postDetails?.postMediaURL}/>
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
                    <CommentInputContainer PostID={localPostID} UserID={props.userID} FetchCommentFunc={FetchComments} WithinRange={withinRange}/>
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

type AuthorContainerProps = {
    localUserID: number;
    localPostID: number;
    withinRange: boolean;
    postDetails: PostProps;
}

function AuthorContainer(props: AuthorContainerProps) {
    const navigation = useNavigation();

    if (props.postDetails.authorID != -1) {
        return (
            <View style={styles.authorLikesContainer}>
                <Pressable onPress={() => navigation.navigate("User Details", {userID: props.postDetails.authorID})}>
                    <View style={styles.authorContainer}>
                        <Image source={{uri:props.postDetails.authorPictureURL}} style={styles.authorImage} resizeMode="cover"/>
                        <Text style={styles.authorText}>{props.postDetails.authorName}</Text>
                    </View>
                </Pressable>
                <LikeButton postID={props.localPostID} userID={props.localUserID} withinRange={props.withinRange}/>
            </View>
        )
    }
    //If the author ID hasn't loaded yet, don't make the profile button interactable
    else {
        return (
            <View style={styles.authorLikesContainer}>
                <View style={styles.authorContainer}>
                    <Image source={{uri:props.postDetails.authorPictureURL}} style={styles.authorImage} resizeMode="cover"/>
                    <Text style={styles.authorText}>{props.postDetails.authorName}</Text>
                </View>
                <LikeButton postID={props.localPostID} userID={props.localUserID} withinRange={props.withinRange}/>
            </View>
        )
    }
}

function ContentImage(props: ImageURLType) {
    if (props.imageURL == "") {
        return <View></View>
    } else {
        return (
            <Image source={{uri:props.imageURL}} style={styles.postImage} resizeMode="contain"/>
        )
    }
}

type LikeButtonProps = {
    userID: number;
    postID: number;
    withinRange: boolean;
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

        if (postLikesData != null) {
            setPostLikes(postLikesData);
        }
    }

    //After liking or unliking, update like number
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

    //If out of range, like button is greyed out
    if (props.withinRange) {
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
    } else {
        return (
            <View style={styles.tooFarLikesButton}>
                <FontAwesome name={"heart"} size={30}/>
                <Text style={styles.likesText}>{postLikes}</Text>
            </View>
        )
    }
}

type CommentInputProps = {
    PostID: number;
    UserID: number;
    FetchCommentFunc: Function;
    WithinRange: boolean;
}

function CommentInputContainer(props: CommentInputProps) {
    const commentRef = useRef(null);
    const [newCommentText, setNewCommentText] = useState("");
    
    async function PostComment() {
        if (newCommentText == "") {
            Alert.alert("Comment cannot be empty!");
        } else {
            const result = await (CreateComment({postID: props.PostID, userID: props.UserID, commentText: newCommentText}));

            //If comment posted successfully, clear input text and update comments
            if (result) {
                commentRef.current.clear();
                props.FetchCommentFunc();
            }
        }
    }

    //If within range, show comment input, otherwise show message
    if (props.WithinRange) {
        return (
            <View style={styles.commentInputContainer}>
                <TextInput ref={commentRef} style={styles.commentTextInput} placeholder={"Enter comment"} onChangeText={(value) => setNewCommentText(value)}/>
                <Pressable style={styles.postCommentButton} onPress={async () => {PostComment()}}>
                    <FontAwesome name="commenting-o" size={25}/>
                </Pressable>
            </View>
        )
    } else {
        return (
            <View style={styles.commentInputContainer}>
                <Text>Not close enough to leave comment.</Text>
            </View>
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
        margin:10,
        paddingTop:15
    },

    scrollViewHolder: {
        flex:5
    },

    scrollContainer: {
        alignItems:'center',
        flex:1
    },

    postImage: {
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

    tooFarLikesButton: {
        backgroundColor: TooFarButtonColour,
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
        borderRadius:10,
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
        padding:15,
        fontSize:18
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