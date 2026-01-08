import { ProfileProps } from '@/screens/Profile/FullProfileScreen';
import * as Location from 'expo-location';
import getDistance from 'geolib/es/getDistance';
import { CheckIfUsersAreMutuallyFollowing, GetJoinedEvents, GetRecentPostsFromEvent, GetRecentPostsFromEventByUser, ReturnUserDetails } from './DBConnect';
import { CommentProps, EventProps, FriendObjectProps, HomePostHolderProps, MessageProps, PostProps } from './PostComponents';

//Converts a react Date into a string for sending to the database
export function ConvertDateTimeForSQL(inputDate: Date) {
    //get month returns one less, add one to be correct (not sure why only month does this and not the others? oh well)
    return inputDate.getFullYear() + "-" + (inputDate.getMonth() + 1) + "-" + inputDate.getDate() + " " + inputDate.getHours() + ":" + inputDate.getMinutes();
}

export type LocationHolder = {
    latitude: number;
    longitude: number;
}

//Gets current coordinates from the location api
export async function GetCurrentLocationCoords(): Promise<LocationHolder> {
    console.log("Attempting to get location");

    //Get permissions
    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status != 'granted') {
        console.error("Permission to use location was denied");
        return {latitude: 0, longitude: 0};
    }

    //If permission granted, get current position and return as a LocationHolder
    const location = await Location.getCurrentPositionAsync({accuracy: Location.LocationAccuracy.High});
    if (location) {
        return {latitude: location.coords.latitude, longitude: location.coords.longitude};
    }

    return {latitude: 0, longitude: 0};
}

//Convert a LocationHolder to a string for use with the database
export function ConvertCoordsForSQL(inputCoords: LocationHolder) {
    const returnString: string = "(" + inputCoords.latitude + "," + inputCoords.longitude + ")";
    return returnString;
}

//Same as the get current location above, except stores as a string for use with the database straight away (could probably just run the other coords function and pass the result into the conversion function? too late now, don't want to mess with what works)
export async function GetCurrentLocationForSQL(): Promise<string> {
    console.log("Attempting to get location");

    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status != 'granted') {
        console.error("Permission to use location was denied");
        return "";
    }

    const location = await Location.getCurrentPositionAsync({accuracy: Location.LocationAccuracy.High});
    const returnString: string = "(" + location.coords.latitude + "," + location.coords.longitude + ")";
    return returnString;
}

//Converts a location string from the database into a LocationHolder
export function ConvertSQLCoordsToNumber(inputString: string): LocationHolder {
    const trimmedString = inputString.replace(/[()]/g, ''); 
    const coordNumbers = trimmedString.split(",");

    return {latitude: Number(coordNumbers[0]), longitude: Number(coordNumbers[1])}
}

//Takes in a JSON array of event details, maps to a list of EventProps
export function ConvertEventListToProps(inputData: Array<JSON>) {
    var propList: EventProps[] = [];

    inputData.map(localEvent => {
        propList.push({eventName: localEvent.event_name, eventDescription: localEvent.event_description, startTime: localEvent.event_starttime, endTime: localEvent.event_endtime, eventID: localEvent.event_id, eventLocation: localEvent.event_location, eventImageURL: localEvent.event_image_url});
    })

    return propList;
}

//Takes in a JSON array of event details, turns first result into EventProps
export function ConvertEventDetailsToProp(inputData: Array<JSON>) {
    const eventJSON: JSON = inputData[0];

    const returnProp: EventProps = {eventName: eventJSON.event_name, eventDescription: eventJSON.event_description, startTime: eventJSON.event_starttime, endTime: eventJSON.event_endtime, eventID: eventJSON.event_id, eventLocation: eventJSON.event_location, eventImageURL: eventJSON.event_image_url};

    return returnProp;
}

//Takes in a JSON array of post details, maps to a list of PostProps
export async function ConvertPostListToProps(inputData: Array<JSON>) {
    const requests = await Promise.all(inputData.map(async (localPost) => {
        const localPostAuthor = await ReturnUserDetails({userID: localPost.user_id});
        const localPostProps: PostProps = {postTitle: localPost.post_title, postBody: localPost.post_body, postMediaURL: localPost.post_image_url, authorName: localPostAuthor[0].username, authorPictureURL: localPostAuthor[0].profile_picture_url, postID: localPost.post_id, location: localPost.post_location, userLocation: {latitude:0, longitude:0}, authorID: localPost.user_id};
        return(localPostProps);
    }));

    return requests;
}

//Takes in a JSON array of post details, turns first result into PostProps
export async function ConvertPostDetailsToProps(inputData: Array<JSON>) {
    const profileJSON: JSON = inputData[0];

    const localUserLocation = await GetCurrentLocationCoords();

    const localPostAuthor = await ReturnUserDetails({userID: profileJSON.user_id});

    const returnProp: PostProps = {postTitle: profileJSON.post_title, postBody: profileJSON.post_body, postMediaURL: profileJSON.post_image_url, authorName: localPostAuthor[0].username, authorPictureURL: localPostAuthor[0].profile_picture_url, postID: profileJSON.post_id, location: profileJSON.post_location, userLocation: localUserLocation, authorID: profileJSON.user_id};

    return returnProp;
}

//Takes in a JSON array of comment details, maps to a list of CommentProps
export async function ConvertCommentListToProps(inputData: Array<JSON>) {
    const requests = await Promise.all(inputData.map(async (localComment) => {
        const localCommentAuthor = await ReturnUserDetails({userID: localComment.user_id});
        const localCommentProps: CommentProps = {authorName: localCommentAuthor[0].username, authorPictureURL: localCommentAuthor[0].profile_picture_url, commentText: localComment.postcomment_text, authorID: localComment.user_id};
        
        return localCommentProps;
    }));

    return requests;
}

//Takes in a user ID, fetches events joined by the user, and makes a list of posts from each of those events
export async function RetrieveRecentPostsForUser(localUserID: number) {
    const eventData: Array<JSON> = await GetJoinedEvents({userID: localUserID});

    const requests = await Promise.all(eventData.map(async (localEvent) => {
        const localEventProps = ConvertEventDetailsToProp([localEvent]);
        const localPostData = await GetRecentPostsFromEvent({eventID: localEventProps.eventID});
        const localPostPropsList: PostProps[] = await ConvertPostListToProps(localPostData);
        
        //Location data isn't necessary here, so location saved as 0 (this will be the same for most props for PostObjects)
        const localHomePostProps: HomePostHolderProps = {postList: localPostPropsList, eventProps: localEventProps, userLocation: {latitude:0, longitude:0}};

        return localHomePostProps;
    }));

    return requests;
}

//Takes in a user ID, fetches all events joined by the user, and then makes a list of posts specifically they have made on those events
//This is a roundabout way to do this, would be better to fetch posts first and events after (this would also prevent posts from not showing if a user leaves an event after)
//But not super necessary to change as it's only recent posts shown anyway, so not needed to be a comprehensive list
export async function RetrieveRecentPostsByUser(localUserID: number) {
    const eventData: Array<JSON> = await GetJoinedEvents({userID: localUserID});

    const requests = await Promise.all(eventData.map(async (localEvent) => {
        const localEventProps = ConvertEventDetailsToProp([localEvent]);
        const localPostData = await GetRecentPostsFromEventByUser({eventID: localEventProps.eventID, userID: localUserID});
        if (localPostData.length == 0) {
            return null;
        }

        const localPostPropsList: PostProps[] = await ConvertPostListToProps(localPostData);
        const localHomePostProps: HomePostHolderProps = {postList: localPostPropsList, eventProps: localEventProps, userLocation: {latitude:0, longitude:0}};

        return localHomePostProps;
    }));

    const nullCheckArray = requests.filter(function (item) {
        return item != null;
    });

    return nullCheckArray;
}

type CheckDistanceProps = {
    startLocation: LocationHolder;
    endLocation: LocationHolder;
}

//Checks if the distance between two given location points is below a threshold (used for checking if close enough to interact)
export function CheckDistance(props: CheckDistanceProps) {
    const maxRange = 500;

    const distance = getDistance({latitude: props.startLocation.latitude, longitude: props.startLocation.longitude}, {latitude: props.endLocation.latitude, longitude: props.endLocation.longitude});
    console.log("Distance to event:", distance);
    
    if (distance > maxRange) {
        console.log("Too far from event, can't interact");
        return false;
    }
    
    console.log("Close enough to event to interact!");
    return true;
}

//Takes in a JSON array, converts first item to ProfileProps
export function ConvertProfileDetailsToProps(inputData: Array<JSON>) {
    const profileJSON: JSON = inputData[0];

    const returnProp: ProfileProps = {username: profileJSON.username, profilePictureURL: profileJSON.profile_picture_url, userStatus: profileJSON.user_status, profileID: profileJSON.user_id};

    return returnProp;
}

type LocalUserUserListProps = {
    localUser: number;
    userList: Array<JSON>;
}

//Takes in a JSON array of users, maps them to FriendObjectProps (while also checking if that user and the local user are mutually following for use with chat)
export async function ConvertUserListToProps(props: LocalUserUserListProps) {
    const requests = await Promise.all(props.userList.map(async (localProfile) => {
        const isMutualVar = await CheckIfUsersAreMutuallyFollowing({localUserID: props.localUser, userToFollowID: localProfile.user_id})

        const localUserProps: FriendObjectProps = {username: localProfile.username, profile_picture_url: localProfile.profile_picture_url, user_status: localProfile.user_status, profileID: localProfile.user_id, isMutual: isMutualVar}

        return localUserProps;
    }));

    return requests;
}

type ChatScreenProps = {
    localUserID: number;
    otherUserID: number;
    messageDataArray: Array<JSON>;
}

//Takes in a JSON array of messages (as well as user IDs of the chat members) and adds them to a list along with user details
export async function ConvertMessageListToProps(props: ChatScreenProps) {
    //Fetch the user profile details first so that it doesn't make a DB fetch for each message
    const localUserData = await ReturnUserDetails({userID: props.localUserID});
    const otherUserData = await ReturnUserDetails({userID: props.otherUserID});

    const localUserProps = ConvertProfileDetailsToProps(localUserData);
    const otherUserProps = ConvertProfileDetailsToProps(otherUserData);

    var messagePropList: MessageProps[] = [];

    props.messageDataArray.map(localMessage => {
        if (localMessage.message_sender_id == props.localUserID) {
            //Unshift here so that messages appear newest at the bottom for the ScrollView
            messagePropList.unshift({authorName: localUserProps.username, authorPictureURL: localUserProps.profilePictureURL, messageText: localMessage.message_contents});
        } else {
            messagePropList.unshift({authorName: otherUserProps.username, authorPictureURL: otherUserProps.profilePictureURL, messageText: localMessage.message_contents});
        }
    });

    return messagePropList;
}