import { GlobalUserIDProps } from "@/app";
import { BackgroundColour, ButtonColour, editButtonStyles, HolderColour } from "@/custom_modules/CustomStyles";
import { CheckIfUserFollowing, FollowUser, GetFollowerCount, GetFollowingCount, GetPostCount, GetUserLikeCount, ReturnUserDetails, UnfollowUser, UpdateUsername, UpdateUserStatus } from "@/custom_modules/DBConnect";
import { ConvertProfileDetailsToProps, RetrieveRecentPostsByUser } from "@/custom_modules/HelperFunctions";
import { BorderLine, HomePostHolderProps, HomePostRoot } from "@/custom_modules/PostComponents";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export type ProfileProps = {
    profileID: number;
    username: string;
    profilePictureURL: string;
    userStatus: string;
}

type ProfileScreenProps = {
    userID: number;
    userProfileID: number | null;
}

export function FullProfileScreen(props: ProfileScreenProps) {
    var localProfileID = -1; 
    const [profileData, setProfileData] = useState<ProfileProps>({profileID: -1, profilePictureURL: "", username: "Loading...", userStatus: ""});
    const [userLikes, setUserLikes] = useState(0);
    const [userFollowing, setUserFollowing] = useState(0);
    const [userFollowers, setUserFollowers] = useState(0);
    const [userPostNum, setUserPostNum] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);

    //If profile ID not passed, retrieve dynamically (this lets the screen work as a root screen on profile page as well as when retrieved)
    if (props.userProfileID == null) {
        const params = useRoute().params;
        const paramProfileID = params.userID;
        localProfileID = paramProfileID;
    } else {
        localProfileID = props.userProfileID;
    }

    const isProfileOwner = (localProfileID == props.userID);

    async function FetchData() {
        const localProfileData = await ReturnUserDetails({userID: localProfileID});
            
        if (localProfileData) {
            const localProfileProps = ConvertProfileDetailsToProps(localProfileData);
            setProfileData(localProfileProps);
        }

        const localUserLikes = await GetUserLikeCount({userID: localProfileID});
        if (localUserLikes) {setUserLikes(localUserLikes);}

        const localUserFollowing = await GetFollowingCount({userID: localProfileID});
        if (localUserFollowing) {setUserFollowing(localUserFollowing);}

        const localUserFollowers = await GetFollowerCount({userID: localProfileID});
        if (localUserFollowers) {setUserFollowers(localUserFollowers);}

        const localPostNum = await GetPostCount({userID: localProfileID});
        if (localPostNum) {setUserPostNum(localPostNum);}

        const hasUserFollowed = await CheckIfUserFollowing({localUserID: props.userID, userToFollowID: localProfileID});
        setIsFollowing(hasUserFollowed);
    }

    useFocusEffect(useCallback(() => {
        FetchData();

        return () => {

        }
    }, []));



    return (
        <View style={styles.container}>
            <UsernameHeader userID={props.userID} isOwner={isProfileOwner} profileData={profileData} successFunction={FetchData} setIsFollowingFunction={setIsFollowing} isFollowing={isFollowing}/>
            <Image source={{uri:"https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}} style={styles.profilePicture} resizeMode="cover"/>
            <View style={styles.userStatsRow}>
                <Text style={styles.userStatText}>{userLikes} Likes</Text>
                <Text style={styles.userStatText}>{userPostNum} Posts</Text>
                <Text style={styles.userStatText}>{userFollowers} Followers</Text>
                <Text style={styles.userStatText}>{userFollowing} Following</Text>
            </View>
            <BorderLine/>
            <View style={styles.userStatusContainer}>
                <UserStatusDisplay userID={props.userID} profileData={profileData} successFunction={FetchData} isOwner={isProfileOwner}/>
            </View>
            <BorderLine/>
            <View style={styles.recentPostsContainer}>
                <Text style={styles.recentPostsText}>Recent Posts</Text>
                <ProfilePosts userID={localProfileID}/>
            </View>
        </View>
    )
}

type ProfileEditModalProps = {
    userID: number;
    isOwner: boolean;
    profileData: ProfileProps;
    successFunction: Function;
}

type ProfileEditFollowModalProps = {
    userID: number;
    isOwner: boolean;
    profileData: ProfileProps;
    successFunction: Function;
    isFollowing: boolean;
    setIsFollowingFunction: (newValue: boolean) => void; 
}



function UsernameHeader(props:ProfileEditFollowModalProps) {    
    const [modalVisible, setModalVisible] = useState(false);
    const [usernameString, setUsernameString] = useState("");

    const usernameInputRef = useRef(null);

    function OpenModal() {
        setUsernameString(props.profileData.username);
        setModalVisible(true);
    }

    async function ModalUpdateUsername() {
        if (usernameString.length <= 2) {
            console.error("Username must be at least three characters long!");
            return;
        }

        const result = await UpdateUsername({userID: props.userID, newString: usernameString});

        if (result) {
            props.successFunction();
            setModalVisible(false);
            setUsernameString("");
        }
    }

    if (props.isOwner) {
        return (
            <View style={editButtonStyles.editRow}>
                <Modal
                visible={modalVisible}
                transparent={true}
                onRequestClose={() => setModalVisible(false)}>
                    <View style={editButtonStyles.modalContainer}>
                        <View style={editButtonStyles.modalView}>
                            <TextInput style={editButtonStyles.modalTextInput} ref={usernameInputRef} placeholder="Enter new username..." onChangeText={(value) => setUsernameString(value)} value={usernameString}/>
                            <Pressable style={editButtonStyles.modalButton} onPress={async () => {ModalUpdateUsername()}}>
                                <Text>Update Username</Text>
                            </Pressable>
                            <Pressable style={editButtonStyles.modalButton} onPress={() => {setModalVisible(false)}}>
                                <Text>Cancel</Text>
                            </Pressable>
                        </View>
                        </View>
                </Modal>

                <Text style={styles.header}>{props.profileData.username}</Text>
                <Pressable style={editButtonStyles.editButton} onPress={() => OpenModal()}>
                    <FontAwesome5 name="edit" size={25}/>
                </Pressable>
            </View>
        )
    } else {
        return (
            <View style={editButtonStyles.editRow}>
                <Text style={styles.header}>{props.profileData.username}</Text>
                <FollowButton localUserID={props.userID} followUserID={props.profileData.profileID} isFollowing={props.isFollowing} setIsFollowingFunction={props.setIsFollowingFunction}/>
            </View>
        )
    }
}

function UserStatusDisplay(props:ProfileEditModalProps) {    
    const [modalVisible, setModalVisible] = useState(false);
    const [userStatusString, setUserStatusString] = useState("");

    const userStatusInputRef = useRef(null);

    function OpenModal() {
        setUserStatusString(props.profileData.userStatus);
        setModalVisible(true);
    }

    async function ModalUpdateUsername() {
        const result = await UpdateUserStatus({userID: props.userID, newString: userStatusString});

        if (result) {
            props.successFunction();
            setModalVisible(false);
            setUserStatusString("");
        }   
    }

    if (props.isOwner) {
        return (
            <View>
                <View style={editButtonStyles.editRow}>
                    <Modal
                    visible={modalVisible}
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}>
                        <View style={editButtonStyles.modalContainer}>
                            <View style={editButtonStyles.modalView}>
                                <TextInput style={editButtonStyles.modalTextInput} ref={userStatusInputRef} placeholder="Enter new status..." onChangeText={(value) => setUserStatusString(value)} value={userStatusString}/>
                                <Pressable style={editButtonStyles.modalButton} onPress={async () => {ModalUpdateUsername()}}>
                                    <Text>Update User Status</Text>
                                </Pressable>
                                <Pressable style={editButtonStyles.modalButton} onPress={() => {setModalVisible(false)}}>
                                    <Text>Cancel</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>
                    <Text>User status:</Text>
                    <Pressable style={editButtonStyles.editButton} onPress={() => OpenModal()}>
                        <FontAwesome5 name="edit" size={15}/>
                    </Pressable>
                </View>
                <Text>{props.profileData.userStatus}</Text>
            </View>
        )
    } else {
        return (
            <View>
                <Text>User status:</Text>
                <Text>{props.profileData.userStatus}</Text>
            </View>
        )
    }
}

function ProfilePosts(props: GlobalUserIDProps) {
    const [holderData, setHolderData] = useState<HomePostHolderProps[]>([]);

    useFocusEffect(useCallback(() => {
        const fetchData = async () => {
            const localHolderData = await RetrieveRecentPostsByUser(props.userID);
            
            if (localHolderData) {
                setHolderData(localHolderData);
            }
        }

        fetchData();

        return () => {

        }
    }, []));

    if (holderData.length==0) {
        return (
            <View style={styles.postContainer}>
                <Text>User hasn't made any posts yet!</Text>
            </View>
        )
    } else {
        return (
            <View style={styles.postContainer}>
                <ScrollView>
                    <HomePostRoot holderList={holderData}/>
                </ScrollView>
            </View>
        )
    }
}

type FollowButtonProps = {
    localUserID: number;
    followUserID: number;
    isFollowing: boolean;
    setIsFollowingFunction: (newValue: boolean) => void; 
}

function FollowButton(props: FollowButtonProps) {
    

    async function FollowUserPress() {
        const result = await FollowUser({localUserID: props.localUserID, userToFollowID: props.followUserID});

        if (result) {
            props.setIsFollowingFunction(true);
        }
    }

    async function UnfollowUserPress() {
        const result = await UnfollowUser({localUserID: props.localUserID, userToFollowID: props.followUserID});

        if (result) {
            props.setIsFollowingFunction(false);
        }
    }

    if (!props.isFollowing) {
        return (
            <Pressable style={styles.followButton} onPress={async() => {FollowUserPress()}}>
                <FontAwesome5 name={"user-plus"} size={20}/>
            </Pressable>
        )
    } else {
        return (
            <Pressable style={styles.followButton} onPress={async() => {UnfollowUserPress()}}>
                <FontAwesome5 name={"user-times"} size={20}/>
            </Pressable>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BackgroundColour,
        alignItems:'center',
    },
    header: {
        justifyContent: 'center',
        alignSelf: 'center',
        paddingTop: 30,
        paddingBottom: 20,
        fontSize:36
    },
    postContainer: {
        marginTop:10,
    },
    profilePicture: {
        width:'50%',
        aspectRatio:1, 
        borderRadius:250,
    },
    usernameText: {

    },
    userStatsRow: {
        flexDirection:'row',
        justifyContent:'space-evenly',
        width:'95%',
        borderRadius:10,
        paddingTop:10,
        paddingBottom:10,
        marginTop:25,
        marginBottom:5
    },
    userStatusContainer: {
        width:'95%',
        justifyContent:'flex-start',
        marginTop:10,
        marginBottom:10,
        padding:5,
        borderRadius:10,
    },
    recentPostsContainer: {
        backgroundColor: HolderColour,
        margin:10,
        marginTop:10,
        paddingTop:10,
        borderRadius:20,
        alignSelf:'stretch',
        flex:1,
        paddingBottom:40
    },
    recentPostsText: {
        fontSize:20,
        marginLeft:20
    },
    userStatText: {
        fontSize:18
    },
    followButton: {
        backgroundColor: ButtonColour,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        padding:10,
        borderRadius:10,
        marginLeft:15
    }
})