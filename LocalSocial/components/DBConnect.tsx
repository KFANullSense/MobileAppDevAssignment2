import { SmallPost } from '@/components/PostComponents';

const DB_URL = 'http://localhost:3000/'

type GetEventProps = {
    event_id: number;
}

export async function getEventPosts(props: GetEventProps) {
    try {
        const response = await fetch('${DB_URL}rpc/geteventposts?eventid={props.event_id}');
        const responseJSON = await response.json();
        

        if (responseJSON.data) {
            var postList: typeof SmallPost[] = [];

            for (var post in responseJSON.data) {
                return <SmallPost authorName ={post.username} postTitle={post.post_title} postBody={post.post_body} postMediaURL={post.post_image_url} authorPictureURL= {""}/>;
            }
        } else {
            console.error("Failed to fetch event: ", responseJSON);
        }
    } catch (error) {
        console.error("Error getting event: ", error);
    }
}