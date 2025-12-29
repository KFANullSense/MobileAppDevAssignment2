import { supabase } from '@/lib/supabase';

type UserDetailsProps = {
    username: string;
    password: string;
}

export async function CreateUser(props: UserDetailsProps) {
    console.log("Attempting to create user with username " + props.username + " and password " + props.password);

    const { data: validateData, error: error } = await supabase.from("users").select("username").eq("username", props.username);

    if (error) {
        console.error("Error logging in: ", error.message);
    }
    else if (validateData?.length != 0) {
        console.log(validateData?.length);
        console.error("User already exists");
    } else {
        await supabase.rpc('createuser', {username_input: props.username, password_input: props.password});
        
        return LogInToUser(props);
    }
}

export async function LogInToUser(props: UserDetailsProps) {
    console.log("Attempting to log in with username " + props.username + " and password " + props.password);

    const {data, error} = await supabase.from("users").select("user_id").eq("username", props.username).eq("password", props.password);
    if (error) {
        console.error("Error logging in: ", error.message);
    } else if (data.length == 0) {
        console.error("Could not find a user with those details");
        return -1;
    }
    else if (data) {
        console.log(data[0].user_id);
        return data[0].user_id;
    }
}

type PostIDProps = {
    postID: number;
}

export async function ReturnPostLikes(props: PostIDProps) {
    console.log("Returning likes count from post ", props.postID);

    const {count, error} = await supabase.from("post_likes").select("*", {count: 'exact', head: 'true'});

    if (error) {
        console.error("Error retrieving post likes: ", error.message);
    } else {
        return count;
    }
}

type EventIDProps = {
    eventID: number;
}

export async function GetPostsFromEvent(props: EventIDProps) {
    console.log("Returning post list from event ", props.eventID);

    const {data, error} = await supabase.rpc("geteventposts", {input_event_id: props.eventID});

    if (error) {
        console.error("Error creating event: ", error);
    } else {
        console.log(data);
    }
}

type EventCreationProps = {
    positionString: string;
    eventName: string;
    eventStartTime: string;
    eventEndTime: string;
}

export async function CreateEvent(props: EventCreationProps) {
    console.log("Atempting to create event");

    const {error} = await supabase.rpc("createevent", {eventname: props.eventName, eventlocation: props.positionString, starttime: props.eventStartTime, endtime: props.eventEndTime});

    if (error) {
        console.error("Error creating event: ", error);
    } else {
        console.log("Event created successfully");
    }
}

type PostCreationProps = {
    postTitle: string;
    postBody: string;
    postImageUrl: string;
    authorID: number;
    eventID: number;
}

export async function CreatePost(props: PostCreationProps) {
    console.log("Atempting to create post");

    const {error} = await supabase.rpc("createpost", {posttitle: props.postTitle, postbody: props.postBody, postImageUrl: props.postImageUrl, authorid: props.authorID, eventid: props.eventID});

    if (error) {
        console.error("Error creating post: ", error);
    } else {
        console.log("Post created successfully");
    }
}