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
    console.log("Attempting to log in with username " + props.username + " and password " + props.password)

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