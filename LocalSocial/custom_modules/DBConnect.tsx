import { supabase } from '@/lib/supabase';

type UserDetailsProps = {
    username: string;
    password: string;
}

export async function CreateUser(props: UserDetailsProps) {
    console.log("Attempting to create user with username " + props.username + " and password " + props.password);

    const { data: validateData, error: error } = await supabase.from("users").select("username").eq("username", props.username);

    if (error) {
        console.error("Error creating user:", error);
    }
    else if (validateData?.length != 0) {
        console.error("User already exists");
    } else {
        await supabase.from("users").insert({ username: props.username, password: props.password, profile_picture_url: "" });
        
        return LogInToUser(props);
    }

    return -1;
}

export async function LogInToUser(props: UserDetailsProps) {
    console.log("Attempting to log in with username " + props.username + " and password " + props.password);

    const {data, error} = await supabase.from("users").select("user_id").eq("username", props.username).eq("password", props.password);
    if (error) {
        console.error("Error logging in:", error);
    } else if (data.length == 0) {
        console.error("Could not find a user with those details");
    }
    else if (data) {
        return data[0].user_id;
    }

    return -1;
}

type PostIDProps = {
    postID: number;
}

export async function ReturnPostLikes(props: PostIDProps) {
    console.log("Returning likes count from post", props.postID);

    const {count, error} = await supabase.from("post_likes").select("*", {count: 'exact', head: true}).eq("post_id", props.postID);

    if (error) {
        console.error("Error retrieving post likes:", error);
    } else {
        return count;
    }

    return -1;
}

export async function ReturnPostComments(props: PostIDProps) {
    console.log("Returning comments from post", props.postID);

    const {data, error} = await supabase.from("post_comments").select("*").eq("post_id", props.postID).order('post_comment_timestamp', {ascending:false});

    if (error) {
        console.error("Error retrieving comments from post:", error)
    } else {
        return data;
    }

    return [];
}

export async function ReturnFullPost(props: PostIDProps) {
    console.log("Returning full post from ID", props.postID);

    const {data, error} = await supabase.rpc("getfullpost", {input_post_id: props.postID});

    if (error) {
        console.error("Error fetching post:", error);
    } else if (data.length == 0) {
        console.error("Post could not be found");
    } else {
        return data;
    }

    return [];
}

type UserIDProps = {
    userID: number;
}

export async function ReturnUserDetails(props: UserIDProps) {
    console.log("Returning user details from ID", props.userID);

    const {data, error} = await supabase.from("users").select("*").eq("user_id", props.userID);

    if (error) {
        console.error("Error fetching user:", error);
    } else if (data.length == 0) {
        console.error("User could not be found");
    } else {
        return data;
    }

    return [];
}

export async function GetPostsFromUser(props: UserIDProps) {
    console.log("Returning post list from user", props.userID);

    const {data, error} = await supabase.rpc("getuserposts", {input_user_id: props.userID});

    if (error) {
        console.error("Error fetching user posts:", error);
    } else {
        return data;
    }

    return [];
}

export async function GetJoinedEvents(props: UserIDProps) {
    console.log("Returning event list from user", props.userID);

    const {data, error} = await supabase.rpc("getuserevents", {input_user_id: props.userID});

    if (error) {
        console.error("Error fetching user events:", error);
    } else {
        return data;
    }

    return [];
}

type EventIDProps = {
    eventID: number;
}

export async function GetPostsFromEvent(props: EventIDProps) {
    console.log("Returning post list from event", props.eventID);

    const {data, error} = await supabase.rpc("geteventposts", {input_event_id: props.eventID});

    if (error) {
        console.error("Error fetching event posts:", error);
    } else {
        return data;
    }

    return [];
}

export async function GetRecentPostsFromEvent(props: EventIDProps) {
    console.log("Returning post list from event", props.eventID);

    const {data, error} = await supabase.rpc("getrecenteventposts", {input_event_id: props.eventID});

    if (error) {
        console.error("Error fetching event posts:", error);
    } else {
        return data;
    }

    return [];
}

export async function GetRecentPostsFromEventByUser(props: EventIDUserIDProps) {
    console.log("Returning post list from event", props.eventID, "by user", props.userID);

    const {data, error} = await supabase.rpc("getrecenteventpostsfromuser", {input_event_id: props.eventID, input_user_id: props.userID});

    if (error) {
        console.error("Error fetching posts:", error);
    } else {
        return data;
    }

    return [];
}

export async function ReturnFullEvent(props: EventIDProps) {
    console.log("Returning full event from ID", props.eventID);

    const {data, error} = await supabase.from("events").select("*").eq("event_id", props.eventID);

    if (error) {
        console.error("Error fetching event:", error);
    } else if (data.length == 0) {
        console.error("Event could not be found");
    } else {
        return data;
    }

    return [];
}

type EventCreationProps = {
    positionString: string;
    eventName: string;
    eventDescription: string;
    eventStartTime: string;
    eventEndTime: string;
    userID: number;
}

export async function CreateEvent(props: EventCreationProps) {
    console.log("Atempting to create event");

    const {error} = await supabase.rpc("createevent", {eventname: props.eventName, eventdescription: props.eventDescription, eventlocation: props.positionString, starttime: props.eventStartTime, endtime: props.eventEndTime, userid: props.userID});

    if (error) {
        console.error("Error creating event:", error);
    } else {
        console.log("Event created successfully");
        return true;
    }

    return false;
}

type PostCreationProps = {
    postTitle: string;
    postBody: string;
    postImageUrl: string;
    authorID: number;
    eventID: number;
    location: string;
}

export async function CreatePost(props: PostCreationProps) {
    console.log("Atempting to create post");

    const {error} = await supabase.rpc("createpost", {posttitle: props.postTitle, postbody: props.postBody, postimageurl: props.postImageUrl, authorid: props.authorID, eventid: props.eventID, eventlocation: props.location});

    if (error) {
        console.error("Error creating post:", error);
    } else {
        console.log("Post created successfully");
        return true;
    }

    return false;
}

type EventLeaveJoinProps = {
    userID: number;
    eventID: number;
}

export async function JoinEvent(props: EventLeaveJoinProps) {
    console.log("Attempting to join user", props.userID, "to event", props.eventID);

    const {data, error: fetchError} = await supabase.from("events").select("*").eq("event_id", props.eventID); 

    if (fetchError) {
        console.error("Error fetching event:", fetchError);
    } else if (data.length == 0) {
        console.error("Event does not exist!");
    } else {
        const {error} = await supabase.from("user_events").insert({ event_id: props.eventID, user_id: props.userID, is_host: false });

        if (error) {
            console.error("Error joining event:", error);
        } else {
            console.log("Event joined successfully");
            return true;
        }
    }
    
    return false;
}

export async function LeaveEvent(props: EventLeaveJoinProps) {
    console.log("Attempting to leave user", props.userID, "from event", props.eventID);

    const {data, error: fetchError} = await supabase.from("events").select("*").eq("event_id", props.eventID); 

    if (fetchError) {
        console.error("Error fetching event:", fetchError);
    } else if (data.length == 0) {
        console.error("Event does not exist!");
    } else {
        const {error} = await supabase.from("user_events").delete().eq("event_id", props.eventID).eq("user_id", props.userID);

        if (error) {
            console.error("Error leaving event:", error);
        } else {
            console.log("Event left successfully");
            return true;
        }
    }

    return false;
}

export async function DeleteEvent(props: EventLeaveJoinProps) {
    console.log("Attempting to delete event", props.eventID);

    const {data, error: fetchError} = await supabase.from("user_events").select("*").eq("event_id", props.eventID).eq("user_id", props.userID).eq("is_host", true); 

    if (fetchError) {
        console.error("Error fetching event:", fetchError);
    } else if (data.length == 0) {
        console.error("Event does not exist or user does not own event!");
    } else {
        const {error} = await supabase.from("events").delete().eq("event_id", props.eventID);

        if (error) {
            console.error("Error deleting event:", error);
        } else {
            console.log("Event deleted successfully");
            return true;
        }
    }

    return false;
}

type EventIDUserIDProps = {
    eventID: number;
    userID: number;
}

export async function IsUserHostOfEvent(props: EventIDUserIDProps) {
    console.log("Checking if user", props.userID, "is host of", props.eventID);

    const {count, error} = await supabase.from("user_events").select("*", {count: 'exact', head: true}).eq("user_id", props.userID).eq("event_id", props.eventID).eq("is_host", true);

    if (error) {
        console.error("Error retrieving user host info:", error);
    } else if (count >= 1) {
        return true;
    }
    return false;
}

export async function HasUserJoinedEvent(props: EventIDUserIDProps) {
    console.log("Checking if user", props.userID, "has joined", props.eventID);

    const {count, error} = await supabase.from("user_events").select("*", {count: 'exact', head: true}).eq("user_id", props.userID).eq("event_id", props.eventID);

    if (error) {
        console.error("Error retrieving user host info:", error);
    } else if (count >= 1) {
        return true;
    }
    return false;
}

type UserLocationProps = {
    location: string;
}

export async function GetNearbyEvents(props:UserLocationProps) {
    console.log("Finding events nearby", props.location);

    const {data, error} = await supabase.rpc("getnearestevents", {input_location: props.location});

    if (error) {
        console.error("Error retrieving nearby events:", error);
    } else {
        return data;
    }
}

type PostCommentProps = {
    postID: number;
    userID: number;
    commentText: string;
}

export async function CreateComment(props:PostCommentProps) {
    console.log("Attemping to post comment", props.commentText, "from user", props.userID, "on post", props.postID);

    const {error} = await supabase.rpc("createcomment", {userid: props.userID, postid: props.postID, comment_text: props.commentText});

    if (error) {
        console.error("Error posting comment:", error);
    } else {
        console.log("Comment posted");
        return true;
    }
    return false;
}

type PostUserProps = {
    postID: number;
    userID: number;
}

export async function HasUserLikedPost(props: PostUserProps) {
    console.log("Checking if user", props.userID, "has liked post", props.postID);

    const {count, error} = await supabase.from("post_likes").select("*", {count: 'exact', head: true}).eq("user_id", props.userID).eq("post_id", props.postID);

    if (error) {
        console.error("Error retrieving post like info:", error);
    } else if (count >= 1) {
        return true;
    }
    return false;
}

export async function LikePost(props:PostUserProps) {
    console.log("User", props.userID, "is attempting to like post", props.postID);

    const {data, error: fetchError} = await supabase.from("post_likes").select("*").eq("post_id", props.postID).eq("user_id", props.userID); 

    if (fetchError) {
        console.error("Error fetching post like:", fetchError);
    } else if (data.length >= 1) {
        console.error("User has already liked post");
    } else {
        const {error} = await supabase.from("post_likes").insert({ user_id: props.userID, post_id: props.postID});

        if (error) {
            console.error("Error liking post:", error);
        } else {
            console.log("Post liked successfully!");
            return true;
        }
    }

    return false;
}

export async function UnlikePost(props:PostUserProps) {
    console.log("User", props.userID, "is attempting to unlike post", props.postID);

    const {data, error: fetchError} = await supabase.from("post_likes").select("*").eq("post_id", props.postID).eq("user_id", props.userID); 

    if (fetchError) {
        console.error("Error fetching post like:", fetchError);
    } else if (data.length == 0) {
        console.error("User has not already liked post");
    } else {
        const {error} = await supabase.from("post_likes").delete().eq("user_id", props.userID).eq("post_id", props.postID);

        if (error) {
            console.error("Error unliking post:", error);
        } else {
            console.log("Post unliked successfully!");
            return true;
        }
    }

    return false;
}