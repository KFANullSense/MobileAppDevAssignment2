import { supabase } from '@/lib/supabase';

type UserDetailsProps = {
    username: string;
    password: string;
}

//Create a user, then immediately log into them
export async function CreateUser(props: UserDetailsProps) {
    console.log("Attempting to create user with username " + props.username + " and password " + props.password);

    const usernameAvailable = await CheckIfUsernameAvailable(props.username);

    if (!usernameAvailable) {
        console.error("Username already in use");
    } else {
        const {error} = await supabase.from("users").insert({ username: props.username, password: props.password, profile_picture_url: "" });

        if (error) {
            console.error("Error creating user:", error);
        } else {
            return LogInToUser(props);
        }
    }

    return -1;
}

//Log in with user details
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

//Return the number of likes on a specified post
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

//Return data list of comments on a specified post
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

//Return post details from specified post
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

//Return user details from specified user
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

//Return all posts from specified user
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

//Return all event data joined by specified user
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

//Returns number of likes on posts created by specified user
export async function GetUserLikeCount(props: UserIDProps) {
    console.log("Returning like count from user", props.userID);

    const {count, error} = await supabase.rpc("getuserlikes", {input_user_id: props.userID});

    if (error) {
        console.error("Error retrieving follower count:", error);
    } else {
        return count;
    }

    return -1;
}

//Returns number of users following specified user
export async function GetFollowerCount(props: UserIDProps) {
    console.log("Returning follower count from user", props.userID);

    //Looking for how many people are following this user (how many followers there are), so look for how many times user shows in following id
    const {count, error} = await supabase.from("user_following").select("*", {count: 'exact', head: true}).eq("following_user_id", props.userID);

    if (error) {
        console.error("Error retrieving follower count:", error);
    } else {
        return count;
    }

    return -1;
}

//Returns number of users that specified user is following
export async function GetFollowingCount(props: UserIDProps) {
    console.log("Returning following count from user", props.userID);

    //Reverse of above function
    const {count, error} = await supabase.from("user_following").select("*", {count: 'exact', head: true}).eq("follower_user_id", props.userID);

    if (error) {
        console.error("Error retrieving following count:", error);
    } else {
        return count;
    }

    return -1;
}

//Returns number of posts made by specified user
export async function GetPostCount(props: UserIDProps) {
    console.log("Returning post count from user", props.userID);

    const {count, error} = await supabase.from("post_event_author").select("*", {count: 'exact', head:true}).eq("user_id", props.userID);

    if (error) {
        console.error("Error retrieving user post count:", error);
    } else {
        return count;
    }

    return -1;
}

//Get list of all users specified user is following
export async function GetFollowingList(props:UserIDProps) {
    console.log("Returning following list from user", props.userID);

    const {data, error} = await supabase.rpc("getuserfollowinglist", {input_user_id: props.userID});

    if (error) {
        console.error("Error retrieving following list:", error);
    } else {
        return data;
    }

    return [];
}

type FollowUserProps = {
    localUserID: number;
    userToFollowID: number;
}

//Local user follows specified user
export async function FollowUser(props: FollowUserProps) {
    console.log("Attempting for user", props.localUserID, "to follow user", props.userToFollowID);

    if (props.localUserID == props.userToFollowID) {
        console.error("User cannot follow themself!");
        return false;
    }

    const {data, error: fetchError} = await supabase.from("user_following").select("*").eq("follower_user_id", props.localUserID).eq("following_user_id", props.userToFollowID); 

    if (fetchError) {
        console.error("Error checking if user already following:", fetchError);
    } else if (data.length >= 1) {
        console.error("User has already followed");
    } else {
        const {error} = await supabase.from("user_following").insert({ follower_user_id: props.localUserID, following_user_id: props.userToFollowID});

        if (error) {
            console.error("Error following user:", error);
        } else {
            console.log("User followed successfully!");
            return true;
        }
    }

    return false;
}

//User unfollows specified user
export async function UnfollowUser(props: FollowUserProps) {
    console.log("Attempting for user", props.localUserID, "to unfollow user", props.userToFollowID);

    const {data, error: fetchError} = await supabase.from("user_following").select("*").eq("follower_user_id", props.localUserID).eq("following_user_id", props.userToFollowID);

    if (fetchError) {
        console.error("Error checking if user already following:", fetchError);
    } else if (data.length == 0) {
        console.error("User isn't following, cannot unfollow");
    } else {
        const {error} = await supabase.from("user_following").delete().eq("follower_user_id", props.localUserID).eq("following_user_id", props.userToFollowID);

        if (error) {
            console.error("Error unfollowing user:", error);
        } else {
            console.log("User unfollowed successfully!");
            return true;
        }
    }

    return false;
}

//Returns true if users are following each other, false otherwise
export async function CheckIfUsersAreMutuallyFollowing(props: FollowUserProps) {
    console.log("Checking if user", props.localUserID, "and user", props.userToFollowID, "are following each other");

    const {count: firstCount, error: firstError} = await supabase.from("user_following").select("*", {count: 'exact', head:true}).eq("following_user_id", props.localUserID).eq("follower_user_id", props.userToFollowID);
    
    if (firstError) {
        console.error("Error on first fetch:", firstError);
        return false;
    }

    const {count: secondCount, error: secondError} = await supabase.from("user_following").select("*", {count: 'exact', head:true}).eq("following_user_id", props.userToFollowID).eq("follower_user_id", props.localUserID);

    if (secondError) {
        console.error("Error on second fetch:", secondError);
        return false;
    }

    if (firstCount >= 1 && secondCount >= 1) {
        return true;
    }

    return false;
}

export async function CheckIfUserFollowing(props: FollowUserProps) {
    console.log("Checking if user", props.localUserID, "is following user", props.userToFollowID);

    const {count, error: fetchError} = await supabase.from("user_following").select("*", {count: 'exact', head:true}).eq("follower_user_id", props.localUserID).eq("following_user_id", props.userToFollowID);

    if (fetchError) {
        console.error("Error checking if user is following:", fetchError);
    } else {
        if (count >= 1) {
            console.log("User is following");
            return true
        } else {
            console.log("User is not following");
        }
    }

    return false
}

type EventIDProps = {
    eventID: number;
}

//Returns all post data from specified event
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

//Returns most recent (current limit at time of writing is 3) posts from specified event
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

//Returns event details from specified event
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

//Creates event with specified details
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

//Create post with specified details
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

type EventIDUserIDProps = {
    eventID: number;
    userID: number;
}

//Join specified user to specified event
export async function JoinEvent(props: EventIDUserIDProps) {
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

//Leave specified user from specified event
export async function LeaveEvent(props: EventIDUserIDProps) {
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

//Delete specified user from specified event
export async function DeleteEvent(props: EventIDUserIDProps) {
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

//Return bool if specified user owns specified event
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

//Return bool if specified user has joined specified event
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

//Returns recent (3 at the time of writing) posts from specified event made by specified user
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

type UserLocationProps = {
    location: string;
}

//Returns (5 at the time of writing) events closest to the user (for use on map markers)
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

//Creates comment with specified details
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

//Checks if specified user has liked specified post
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

//Specified user likes specified post
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

//Specified user unlikes specified post
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

type UpdateUserStringProps = {
    userID: number;
    newString: string;
}

//Updates username of specified user
export async function UpdateUsername(props: UpdateUserStringProps) {
    console.log("Updating username of user", props.userID, "to new string", props.newString);

    const {count:fetchCount, error:fetchError} = await supabase.from("users").select("*", {count: 'exact', head: true}).eq("user_id", props.userID);

    if (fetchError) {
        console.error("Error fetching user", fetchError);
    } else if (fetchCount <= 0) {
        console.error("User does not exist");
    } else {
        const usernameAvailable = await CheckIfUsernameAvailable(props.newString);

        if (usernameAvailable) {
            const {error} = await supabase.from("users").update({username: props.newString}).eq("user_id", props.userID);

            if (error) {
                console.error("Error updating username", error);
            } else {
                console.log("Username updated successfully!");
                return true;
            }
        }
    }

    return false;
}

//Updates status of specified user
export async function UpdateUserStatus(props: UpdateUserStringProps) {
    console.log("Updating status of user", props.userID, "to new string", props.newString);

    const {count:fetchCount, error:fetchError} = await supabase.from("users").select("*", {count: 'exact', head: true}).eq("user_id", props.userID);

    if (fetchError) {
        console.error("Error fetching user", fetchError);
    } else if (fetchCount <= 0) {
        console.error("User does not exist");
    } else {
        const {error} = await supabase.from("users").update({user_status: props.newString}).eq("user_id", props.userID);

        if (error) {
            console.error("Error updating status", error);
        } else {
            console.log("Status updated successfully!");
            return true;
        }
    }

    return false;
}

//Updates profile picture url of specified user
export async function UpdateUserProfilePicture(props: UpdateUserStringProps) {
    console.log("Updating profile picture URL of user", props.userID, "to new string", props.newString);

    const {count:fetchCount, error:fetchError} = await supabase.from("users").select("*", {count: 'exact', head: true}).eq("user_id", props.userID);

    if (fetchError) {
        console.error("Error fetching user", fetchError);
    } else if (fetchCount <= 0) {
        console.error("User does not exist");
    } else {
        const {error} = await supabase.from("users").update({profile_picture_url: props.newString}).eq("user_id", props.userID);

        if (error) {
            console.error("Error updating profile picture URL", error);
        } else {
            console.log("Profile picture URL updated successfully!");
            return true;
        }
    }

    return false;
}

type UpdateEventStringProps = {
    eventID: number;
    newString: string;
}

//Updates name of specified event
export async function UpdateEventName(props: UpdateEventStringProps) {
    console.log("Updating name of event", props.eventID, "to new string", props.newString);

    const {count:fetchCount, error:fetchError} = await supabase.from("events").select("*", {count: 'exact', head: true}).eq("event_id", props.eventID);

    if (fetchError) {
        console.error("Error fetching event", fetchError);
    } else if (fetchCount <= 0) {
        console.error("Event does not exist");
    } else {
        const {error} = await supabase.from("events").update({event_name: props.newString}).eq("event_id", props.eventID);

        if (error) {
            console.error("Error updating event name", error);
        } else {
            console.log("Event name updated successfully!");
            return true;
        }
    }

    return false;
}

//Updates description of specified event
export async function UpdateEventDescription(props: UpdateEventStringProps) {
    console.log("Updating description of event", props.eventID, "to new string", props.newString);

    const {count:fetchCount, error:fetchError} = await supabase.from("events").select("*", {count: 'exact', head: true}).eq("event_id", props.eventID);

    if (fetchError) {
        console.error("Error fetching event", fetchError);
    } else if (fetchCount <= 0) {
        console.error("Event does not exist");
    } else {
        const {error} = await supabase.from("events").update({event_description: props.newString}).eq("event_id", props.eventID);

        if (error) {
            console.error("Error updating event description", error);
        } else {
            console.log("Event description updated successfully!");
            return true;
        }
    }

    return false;
}

//Returns true if username is available
export async function CheckIfUsernameAvailable(nameToCheck: string) {
    console.log("Checking if username", nameToCheck, "exists");

    const {count:fetchCount, error:fetchError} = await supabase.from("users").select("*", {count: 'exact', head: true}).eq("username", nameToCheck);

    if (fetchError) {
        console.error("Error checking name", fetchError);
    } else if (fetchCount >= 1) {
        console.error("Username is in use");
    } else {
        console.log("Name is free");
        return true;
    }

    return false;
}

type ImageUploadProps = {
    userID: number;
    imageURI: string;
}

//Uploads a local image to storage and returns public URL
export async function UploadImage(props: ImageUploadProps) {
    console.log("Attempting to upload image for user", props.userID, "with local path", props.imageURI)

    const imageResponse = await fetch(props.imageURI);
    const imageBlob = await imageResponse.blob();
    const imageArrayBuffer = await new Response(imageBlob).arrayBuffer();
    const fileName = "public/" + props.userID + "/" + Date.now() + ".jpg";

    const {data, error} = await supabase.storage.from("files").upload(fileName, imageArrayBuffer, {contentType: 'image/jpeg', upsert: false});

    if (error) {
        console.error("Error uploading image:", error);
    } else {
        const uploadedImageURL = await RetrieveImageURL({userID: props.userID, imageURI: data.path});

        return uploadedImageURL;
    }

    return "";
}

//Retrieves public URL for image in storage bucket
export async function RetrieveImageURL(props: ImageUploadProps) {
    console.log("Retrieving full image URL for uploaded image with path", props.imageURI);

    const {data} = supabase.storage.from("files").getPublicUrl(props.imageURI);

    if (data) {
        console.log("Image URL retrieved at", data.publicUrl);
        return data.publicUrl;
    }
}