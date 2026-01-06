--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.0

-- Started on 2026-01-06 00:03:42

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 18 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3789 (class 0 OID 0)
-- Dependencies: 18
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 428 (class 1255 OID 32036)
-- Name: createcomment(integer, integer, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.createcomment(userid integer, postid integer, comment_text character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
	insert into post_comments (postcomment_text, user_id, post_id, post_comment_timestamp)
		values (comment_text, userid, postid, CURRENT_TIMESTAMP);
end;
$$;


ALTER FUNCTION public.createcomment(userid integer, postid integer, comment_text character varying) OWNER TO postgres;

--
-- TOC entry 433 (class 1255 OID 34343)
-- Name: createevent(character varying, character varying, point, timestamp without time zone, timestamp without time zone, integer, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer, eventimageurl character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
	with rows as (
		insert into "events" (event_name, event_description, event_location,  event_starttime, event_endtime, event_image_url)
		values (eventname, eventdescription, eventlocation, starttime, endtime, eventimageurl)
		returning event_id
	)
	insert into user_events (event_id, user_id, is_host)
		values ((select event_id from rows), userid, true);
end;
$$;


ALTER FUNCTION public.createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer, eventimageurl character varying) OWNER TO postgres;

--
-- TOC entry 425 (class 1255 OID 30927)
-- Name: createpost(character varying, character varying, character varying, integer, integer, point); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.createpost(posttitle character varying, postbody character varying, postimageurl character varying, authorid integer, eventid integer, eventlocation point) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
	with rows as (
		insert into "posts" (post_title, post_body,  post_image_url, is_announcement, post_timestamp, post_location)
		values (postTitle, postBody, postImageUrl, false, CURRENT_TIMESTAMP, eventlocation)
		returning post_id
	)
	insert into post_event_author (post_id, user_id, event_id)
		values ((select post_id from rows), authorID, eventID);
end;
$$;


ALTER FUNCTION public.createpost(posttitle character varying, postbody character varying, postimageurl character varying, authorid integer, eventid integer, eventlocation point) OWNER TO postgres;

--
-- TOC entry 436 (class 1255 OID 34383)
-- Name: getchatmessages(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getchatmessages(first_user_id integer, second_user_id integer) RETURNS TABLE(user_message_id integer, message_sender_id integer, message_receiver_id integer, message_contents character varying, message_timestamp timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
begin
return query (select * from user_messages where
	user_messages.message_receiver_id = first_user_id and user_messages.message_sender_id = second_user_id
	union
	select * from user_messages where
	user_messages.message_receiver_id = second_user_id and user_messages.message_sender_id = first_user_id)
	order by message_timestamp desc;
end;
$$;


ALTER FUNCTION public.getchatmessages(first_user_id integer, second_user_id integer) OWNER TO postgres;

--
-- TOC entry 426 (class 1255 OID 30928)
-- Name: geteventposts(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.geteventposts(input_event_id integer) RETURNS TABLE(post_id integer, post_title character varying, post_body character varying, post_image_url character varying, is_announcement boolean, post_datetime timestamp without time zone, post_location point, user_id integer)
    LANGUAGE plpgsql
    AS $$
begin
return query select posts.*, post_event_author.user_id from post_event_author
	inner join posts on posts.post_id = post_event_author.post_id
	where post_event_author.post_id in (select post_event_author.post_id from post_event_author where event_id = input_event_id)
	order by posts.post_timestamp DESC;
end;
$$;


ALTER FUNCTION public.geteventposts(input_event_id integer) OWNER TO postgres;

--
-- TOC entry 427 (class 1255 OID 30929)
-- Name: getfullpost(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getfullpost(input_post_id integer) RETURNS TABLE(post_id integer, post_title character varying, post_body character varying, post_image_url character varying, is_announcement boolean, post_datetime timestamp without time zone, post_location point, user_id integer)
    LANGUAGE plpgsql
    AS $$
begin
return query select posts.*, post_event_author.user_id from post_event_author
	inner join posts on posts.post_id = post_event_author.post_id
	where post_event_author.post_id in (select post_event_author.post_id from post_event_author where post_event_author.post_id = input_post_id);
end;
$$;


ALTER FUNCTION public.getfullpost(input_post_id integer) OWNER TO postgres;

--
-- TOC entry 435 (class 1255 OID 34372)
-- Name: getnearestevents(point); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getnearestevents(input_location point) RETURNS TABLE(event_id integer, event_name character varying, event_location point, event_starttime timestamp without time zone, event_endtime timestamp without time zone, event_description character varying, event_image_url character varying)
    LANGUAGE plpgsql
    AS $$
begin
return query select * from events
	order by events.event_location <-> input_location
	limit 5;
end;
$$;


ALTER FUNCTION public.getnearestevents(input_location point) OWNER TO postgres;

--
-- TOC entry 429 (class 1255 OID 32037)
-- Name: getrecenteventposts(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getrecenteventposts(input_event_id integer) RETURNS TABLE(post_id integer, post_title character varying, post_body character varying, post_image_url character varying, is_announcement boolean, post_datetime timestamp without time zone, post_location point, user_id integer)
    LANGUAGE plpgsql
    AS $$
begin
return query select posts.*, post_event_author.user_id from post_event_author
	inner join posts on posts.post_id = post_event_author.post_id
	where post_event_author.post_id in (select post_event_author.post_id from post_event_author where event_id = input_event_id)
	order by posts.post_timestamp DESC
	limit 3;
end;
$$;


ALTER FUNCTION public.getrecenteventposts(input_event_id integer) OWNER TO postgres;

--
-- TOC entry 430 (class 1255 OID 33145)
-- Name: getrecenteventpostsfromuser(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getrecenteventpostsfromuser(input_event_id integer, input_user_id integer) RETURNS TABLE(post_id integer, post_title character varying, post_body character varying, post_image_url character varying, is_announcement boolean, post_datetime timestamp without time zone, post_location point, user_id integer)
    LANGUAGE plpgsql
    AS $$
begin
return query select posts.*, post_event_author.user_id from post_event_author
	inner join posts on posts.post_id = post_event_author.post_id
	where post_event_author.post_id in (select post_event_author.post_id from post_event_author where post_event_author.event_id = input_event_id and post_event_author.user_id = input_user_id)
	order by posts.post_timestamp DESC
	limit 3;
end;
$$;


ALTER FUNCTION public.getrecenteventpostsfromuser(input_event_id integer, input_user_id integer) OWNER TO postgres;

--
-- TOC entry 434 (class 1255 OID 34371)
-- Name: getuserevents(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getuserevents(input_user_id integer) RETURNS TABLE(event_id integer, event_name character varying, event_location point, event_starttime timestamp without time zone, event_endtime timestamp without time zone, event_description character varying, event_image_url character varying)
    LANGUAGE plpgsql
    AS $$
begin
return query select events.* from user_events
	inner join events on events.event_id = user_events.event_id
	where user_events.user_id = input_user_id
	order by events.event_endtime asc;
end;
$$;


ALTER FUNCTION public.getuserevents(input_user_id integer) OWNER TO postgres;

--
-- TOC entry 432 (class 1255 OID 34260)
-- Name: getuserfollowinglist(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getuserfollowinglist(input_user_id integer) RETURNS TABLE(user_id integer, username character varying, profile_picture_url character varying, user_status character varying)
    LANGUAGE plpgsql
    AS $$
begin
return query select users.user_id, users.username, users.profile_picture_url, users.user_status from users
	where users.user_id in (select user_following.following_user_id from user_following where user_following.follower_user_id = input_user_id);
end;
$$;


ALTER FUNCTION public.getuserfollowinglist(input_user_id integer) OWNER TO postgres;

--
-- TOC entry 431 (class 1255 OID 33152)
-- Name: getuserlikes(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getuserlikes(input_user_id integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
begin
	return (
	select count(*) from post_likes
	where post_likes.post_id in (select post_event_author.post_id from post_event_author where user_id = input_user_id)
	);
end;
$$;


ALTER FUNCTION public.getuserlikes(input_user_id integer) OWNER TO postgres;

--
-- TOC entry 423 (class 1255 OID 27569)
-- Name: getuserposts(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getuserposts(input_user_id integer) RETURNS TABLE(post_id integer, post_title character varying, post_body character varying, post_image_url character varying, is_announcement boolean, post_datetime timestamp without time zone, event_id integer)
    LANGUAGE plpgsql
    AS $$
begin
return query select posts.*, post_event_author.event_id from post_event_author
	inner join posts on posts.post_id = post_event_author.post_id
	where post_event_author.post_id in (select post_event_author.post_id from post_event_author where user_id = input_user_id)
	order by posts.post_timestamp DESC;
end;
$$;


ALTER FUNCTION public.getuserposts(input_user_id integer) OWNER TO postgres;

--
-- TOC entry 424 (class 1255 OID 30919)
-- Name: reversecascadedeleteposts(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reversecascadedeleteposts() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    DELETE FROM posts WHERE post_id = old.post_id;

	return old;
END$$;


ALTER FUNCTION public.reversecascadedeleteposts() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 280 (class 1259 OID 17498)
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    event_id integer NOT NULL,
    event_name character varying NOT NULL,
    event_location point NOT NULL,
    event_starttime timestamp without time zone NOT NULL,
    event_endtime timestamp without time zone NOT NULL,
    event_description character varying,
    event_image_url character varying
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 17591)
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO postgres;

--
-- TOC entry 3806 (class 0 OID 0)
-- Dependencies: 288
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.event_id;


--
-- TOC entry 281 (class 1259 OID 17503)
-- Name: post_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_comments (
    postcomment_id integer NOT NULL,
    postcomment_text character varying NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    post_comment_timestamp timestamp without time zone NOT NULL
);


ALTER TABLE public.post_comments OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 17593)
-- Name: post_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.post_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_comments_id_seq OWNER TO postgres;

--
-- TOC entry 3809 (class 0 OID 0)
-- Dependencies: 289
-- Name: post_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.post_comments_id_seq OWNED BY public.post_comments.postcomment_id;


--
-- TOC entry 282 (class 1259 OID 17508)
-- Name: post_event_author; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_event_author (
    posteventauthor_id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL
);


ALTER TABLE public.post_event_author OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 17511)
-- Name: post_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_likes (
    postlikes_id integer NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL
);


ALTER TABLE public.post_likes OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 17597)
-- Name: post_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.post_likes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_likes_id_seq OWNER TO postgres;

--
-- TOC entry 3813 (class 0 OID 0)
-- Dependencies: 291
-- Name: post_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.post_likes_id_seq OWNED BY public.post_likes.postlikes_id;


--
-- TOC entry 290 (class 1259 OID 17595)
-- Name: posteventauthor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posteventauthor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posteventauthor_id_seq OWNER TO postgres;

--
-- TOC entry 3815 (class 0 OID 0)
-- Dependencies: 290
-- Name: posteventauthor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posteventauthor_id_seq OWNED BY public.post_event_author.posteventauthor_id;


--
-- TOC entry 284 (class 1259 OID 17514)
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    post_id integer NOT NULL,
    post_title character varying NOT NULL,
    post_body character varying NOT NULL,
    post_image_url character varying,
    is_announcement boolean NOT NULL,
    post_timestamp timestamp without time zone NOT NULL,
    post_location point NOT NULL
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 17599)
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO postgres;

--
-- TOC entry 3818 (class 0 OID 0)
-- Dependencies: 292
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.post_id;


--
-- TOC entry 285 (class 1259 OID 17519)
-- Name: user_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_events (
    userevent_id integer NOT NULL,
    event_id integer NOT NULL,
    user_id integer NOT NULL,
    is_host boolean NOT NULL
);


ALTER TABLE public.user_events OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 17601)
-- Name: user_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_events_id_seq OWNER TO postgres;

--
-- TOC entry 3821 (class 0 OID 0)
-- Dependencies: 293
-- Name: user_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_events_id_seq OWNED BY public.user_events.userevent_id;


--
-- TOC entry 294 (class 1259 OID 27574)
-- Name: user_following; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_following (
    follower_user_id integer NOT NULL,
    following_user_id integer NOT NULL,
    user_following_id integer NOT NULL
);


ALTER TABLE public.user_following OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 34344)
-- Name: user_following_user_following_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_following_user_following_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_following_user_following_id_seq OWNER TO postgres;

--
-- TOC entry 3824 (class 0 OID 0)
-- Dependencies: 295
-- Name: user_following_user_following_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_following_user_following_id_seq OWNED BY public.user_following.user_following_id;


--
-- TOC entry 297 (class 1259 OID 34352)
-- Name: user_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_messages (
    user_message_id integer NOT NULL,
    message_sender_id integer NOT NULL,
    message_receiver_id integer NOT NULL,
    message_contents character varying NOT NULL,
    message_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_messages OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 34351)
-- Name: user_messages_user_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_messages_user_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_messages_user_message_id_seq OWNER TO postgres;

--
-- TOC entry 3827 (class 0 OID 0)
-- Dependencies: 296
-- Name: user_messages_user_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_messages_user_message_id_seq OWNED BY public.user_messages.user_message_id;


--
-- TOC entry 286 (class 1259 OID 17522)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying NOT NULL,
    password character varying NOT NULL,
    profile_picture_url character varying,
    user_status character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 17588)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3830 (class 0 OID 0)
-- Dependencies: 287
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 3575 (class 2604 OID 17592)
-- Name: events event_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- TOC entry 3576 (class 2604 OID 17594)
-- Name: post_comments postcomment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments ALTER COLUMN postcomment_id SET DEFAULT nextval('public.post_comments_id_seq'::regclass);


--
-- TOC entry 3577 (class 2604 OID 17596)
-- Name: post_event_author posteventauthor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_event_author ALTER COLUMN posteventauthor_id SET DEFAULT nextval('public.posteventauthor_id_seq'::regclass);


--
-- TOC entry 3578 (class 2604 OID 17598)
-- Name: post_likes postlikes_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes ALTER COLUMN postlikes_id SET DEFAULT nextval('public.post_likes_id_seq'::regclass);


--
-- TOC entry 3579 (class 2604 OID 17600)
-- Name: posts post_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN post_id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- TOC entry 3580 (class 2604 OID 17602)
-- Name: user_events userevent_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_events ALTER COLUMN userevent_id SET DEFAULT nextval('public.user_events_id_seq'::regclass);


--
-- TOC entry 3582 (class 2604 OID 34345)
-- Name: user_following user_following_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_following ALTER COLUMN user_following_id SET DEFAULT nextval('public.user_following_user_following_id_seq'::regclass);


--
-- TOC entry 3583 (class 2604 OID 34355)
-- Name: user_messages user_message_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages ALTER COLUMN user_message_id SET DEFAULT nextval('public.user_messages_user_message_id_seq'::regclass);


--
-- TOC entry 3581 (class 2604 OID 17589)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3766 (class 0 OID 17498)
-- Dependencies: 280
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (event_id, event_name, event_location, event_starttime, event_endtime, event_description, event_image_url) FROM stdin;
13	Test event on user 2	(37.4219983,-122.084)	2026-01-05 21:58:00	2026-01-14 21:58:00	Here's an event that is a test!	https://kfsnhareeqqsrlnwylox.supabase.co/storage/v1/object/public/files/public/15/1767650335163.jpg
\.


--
-- TOC entry 3767 (class 0 OID 17503)
-- Dependencies: 281
-- Data for Name: post_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_comments (postcomment_id, postcomment_text, user_id, post_id, post_comment_timestamp) FROM stdin;
9	Wow! That's pretty cool	14	19	2026-01-05 22:21:28.347032
\.


--
-- TOC entry 3768 (class 0 OID 17508)
-- Dependencies: 282
-- Data for Name: post_event_author; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_event_author (posteventauthor_id, post_id, user_id, event_id) FROM stdin;
18	18	15	13
19	19	14	13
\.


--
-- TOC entry 3769 (class 0 OID 17511)
-- Dependencies: 283
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_likes (postlikes_id, user_id, post_id) FROM stdin;
\.


--
-- TOC entry 3770 (class 0 OID 17514)
-- Dependencies: 284
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (post_id, post_title, post_body, post_image_url, is_announcement, post_timestamp, post_location) FROM stdin;
18	Post on the event	Yayyy here it is!	https://kfsnhareeqqsrlnwylox.supabase.co/storage/v1/object/public/files/public/15/1767650354061.jpg	f	2026-01-05 22:00:23.962458	(37.4219983,-122.084)
19	Here's a post from user 1!	Yep here it is		f	2026-01-05 22:11:27.079569	(37.42342342342342,-122.08395287867832)
\.


--
-- TOC entry 3771 (class 0 OID 17519)
-- Dependencies: 285
-- Data for Name: user_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_events (userevent_id, event_id, user_id, is_host) FROM stdin;
22	13	15	t
25	13	14	f
\.


--
-- TOC entry 3780 (class 0 OID 27574)
-- Dependencies: 294
-- Data for Name: user_following; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_following (follower_user_id, following_user_id, user_following_id) FROM stdin;
14	15	1
15	14	2
\.


--
-- TOC entry 3783 (class 0 OID 34352)
-- Dependencies: 297
-- Data for Name: user_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_messages (user_message_id, message_sender_id, message_receiver_id, message_contents, message_timestamp) FROM stdin;
2	14	15	hi there	2026-01-05 22:43:01.679232
3	14	15	can you read these?	2026-01-05 22:43:01.705468
4	15	14	yep, reading loud and clear!	2026-01-05 22:43:01.73121
5	14	15	Whjat about this one?	2026-01-05 23:45:14.990144
6	14	15	Great! The chat works it looks like	2026-01-05 23:45:21.05185
7	14	15	What if I keep sending messages?	2026-01-05 23:46:11.726694
8	14	15	What if i	2026-01-05 23:46:18.542816
9	14	15	t	2026-01-05 23:46:24.128081
10	14	15	t	2026-01-05 23:46:24.939961
11	14	15	t	2026-01-05 23:46:25.607198
12	14	15	t	2026-01-05 23:46:26.274432
13	14	15	qwe	2026-01-05 23:46:27.123755
14	14	15	qwr	2026-01-05 23:46:27.86122
15	14	15	erwtw	2026-01-05 23:46:30.460251
16	14	15	Yay it works	2026-01-05 23:46:47.598786
17	14	15	test	2026-01-05 23:46:54.437758
18	14	15	test	2026-01-05 23:48:08.49879
19	14	15	Even more messages	2026-01-05 23:48:11.682841
20	15	14	Test more	2026-01-05 23:49:49.971179
21	15	14	Great !	2026-01-05 23:49:52.50601
22	15	14	Here's more messages	2026-01-05 23:58:46.522261
23	15	14	Hey'	2026-01-06 00:01:19.97122
24	14	15	Hi! I'm chatting with you right now!	2026-01-06 00:01:28.188591
\.


--
-- TOC entry 3772 (class 0 OID 17522)
-- Dependencies: 286
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password, profile_picture_url, user_status) FROM stdin;
14	User1	test	file:///data/user/0/host.exp.exponent/cache/ImagePicker/cd520eb4-5b5e-4d0a-acd3-fc643d8602a9.jpeg	Feeling pretty epic!
15	User2	test	https://kfsnhareeqqsrlnwylox.supabase.co/storage/v1/object/public/files/public/emptypfp.jpg	\N
\.


--
-- TOC entry 3832 (class 0 OID 0)
-- Dependencies: 288
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 13, true);


--
-- TOC entry 3833 (class 0 OID 0)
-- Dependencies: 289
-- Name: post_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.post_comments_id_seq', 9, true);


--
-- TOC entry 3834 (class 0 OID 0)
-- Dependencies: 291
-- Name: post_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.post_likes_id_seq', 22, true);


--
-- TOC entry 3835 (class 0 OID 0)
-- Dependencies: 290
-- Name: posteventauthor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posteventauthor_id_seq', 19, true);


--
-- TOC entry 3836 (class 0 OID 0)
-- Dependencies: 292
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 19, true);


--
-- TOC entry 3837 (class 0 OID 0)
-- Dependencies: 293
-- Name: user_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_events_id_seq', 25, true);


--
-- TOC entry 3838 (class 0 OID 0)
-- Dependencies: 295
-- Name: user_following_user_following_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_following_user_following_id_seq', 2, true);


--
-- TOC entry 3839 (class 0 OID 0)
-- Dependencies: 296
-- Name: user_messages_user_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_messages_user_message_id_seq', 24, true);


--
-- TOC entry 3840 (class 0 OID 0)
-- Dependencies: 287
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- TOC entry 3586 (class 2606 OID 17528)
-- Name: events event_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT event_id PRIMARY KEY (event_id);


--
-- TOC entry 3594 (class 2606 OID 17530)
-- Name: posts post_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT post_id PRIMARY KEY (post_id);


--
-- TOC entry 3588 (class 2606 OID 17532)
-- Name: post_comments postcomment_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT postcomment_id PRIMARY KEY (postcomment_id);


--
-- TOC entry 3590 (class 2606 OID 17534)
-- Name: post_event_author posteventauthor_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_event_author
    ADD CONSTRAINT posteventauthor_id PRIMARY KEY (posteventauthor_id);


--
-- TOC entry 3592 (class 2606 OID 17536)
-- Name: post_likes postlikes_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT postlikes_id PRIMARY KEY (postlikes_id);


--
-- TOC entry 3600 (class 2606 OID 34350)
-- Name: user_following user_following_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_following
    ADD CONSTRAINT user_following_id PRIMARY KEY (user_following_id);


--
-- TOC entry 3598 (class 2606 OID 17538)
-- Name: users user_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_id PRIMARY KEY (user_id);


--
-- TOC entry 3602 (class 2606 OID 34359)
-- Name: user_messages user_message_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages
    ADD CONSTRAINT user_message_id PRIMARY KEY (user_message_id);


--
-- TOC entry 3596 (class 2606 OID 17540)
-- Name: user_events userevent_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT userevent_id PRIMARY KEY (userevent_id);


--
-- TOC entry 3616 (class 2620 OID 30920)
-- Name: post_event_author reversecascadedeletepoststrigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER reversecascadedeletepoststrigger AFTER DELETE ON public.post_event_author FOR EACH ROW EXECUTE FUNCTION public.reversecascadedeleteposts();


--
-- TOC entry 3605 (class 2606 OID 30903)
-- Name: post_event_author event_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_event_author
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;


--
-- TOC entry 3610 (class 2606 OID 30921)
-- Name: user_events event_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;


--
-- TOC entry 3612 (class 2606 OID 34287)
-- Name: user_following follower_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_following
    ADD CONSTRAINT follower_user_id FOREIGN KEY (follower_user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3613 (class 2606 OID 34282)
-- Name: user_following following_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_following
    ADD CONSTRAINT following_user_id FOREIGN KEY (following_user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3614 (class 2606 OID 34365)
-- Name: user_messages message_receiver_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages
    ADD CONSTRAINT message_receiver_id FOREIGN KEY (message_receiver_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3615 (class 2606 OID 34360)
-- Name: user_messages message_sender_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages
    ADD CONSTRAINT message_sender_id FOREIGN KEY (message_sender_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3606 (class 2606 OID 30908)
-- Name: post_event_author post_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_event_author
    ADD CONSTRAINT post_id FOREIGN KEY (post_id) REFERENCES public.posts(post_id) ON DELETE CASCADE;


--
-- TOC entry 3608 (class 2606 OID 34262)
-- Name: post_likes post_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_id FOREIGN KEY (post_id) REFERENCES public.posts(post_id) ON DELETE CASCADE;


--
-- TOC entry 3603 (class 2606 OID 34272)
-- Name: post_comments post_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_id FOREIGN KEY (post_id) REFERENCES public.posts(post_id) ON DELETE CASCADE;


--
-- TOC entry 3607 (class 2606 OID 30913)
-- Name: post_event_author user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_event_author
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3609 (class 2606 OID 34267)
-- Name: post_likes user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3604 (class 2606 OID 34277)
-- Name: post_comments user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3611 (class 2606 OID 34292)
-- Name: user_events user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3790 (class 0 OID 0)
-- Dependencies: 18
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- TOC entry 3791 (class 0 OID 0)
-- Dependencies: 428
-- Name: FUNCTION createcomment(userid integer, postid integer, comment_text character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.createcomment(userid integer, postid integer, comment_text character varying) TO anon;
GRANT ALL ON FUNCTION public.createcomment(userid integer, postid integer, comment_text character varying) TO authenticated;
GRANT ALL ON FUNCTION public.createcomment(userid integer, postid integer, comment_text character varying) TO service_role;


--
-- TOC entry 3792 (class 0 OID 0)
-- Dependencies: 433
-- Name: FUNCTION createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer, eventimageurl character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer, eventimageurl character varying) TO anon;
GRANT ALL ON FUNCTION public.createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer, eventimageurl character varying) TO authenticated;
GRANT ALL ON FUNCTION public.createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer, eventimageurl character varying) TO service_role;


--
-- TOC entry 3793 (class 0 OID 0)
-- Dependencies: 425
-- Name: FUNCTION createpost(posttitle character varying, postbody character varying, postimageurl character varying, authorid integer, eventid integer, eventlocation point); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.createpost(posttitle character varying, postbody character varying, postimageurl character varying, authorid integer, eventid integer, eventlocation point) TO anon;
GRANT ALL ON FUNCTION public.createpost(posttitle character varying, postbody character varying, postimageurl character varying, authorid integer, eventid integer, eventlocation point) TO authenticated;
GRANT ALL ON FUNCTION public.createpost(posttitle character varying, postbody character varying, postimageurl character varying, authorid integer, eventid integer, eventlocation point) TO service_role;


--
-- TOC entry 3794 (class 0 OID 0)
-- Dependencies: 436
-- Name: FUNCTION getchatmessages(first_user_id integer, second_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getchatmessages(first_user_id integer, second_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.getchatmessages(first_user_id integer, second_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getchatmessages(first_user_id integer, second_user_id integer) TO service_role;


--
-- TOC entry 3795 (class 0 OID 0)
-- Dependencies: 426
-- Name: FUNCTION geteventposts(input_event_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.geteventposts(input_event_id integer) TO anon;
GRANT ALL ON FUNCTION public.geteventposts(input_event_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.geteventposts(input_event_id integer) TO service_role;


--
-- TOC entry 3796 (class 0 OID 0)
-- Dependencies: 427
-- Name: FUNCTION getfullpost(input_post_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getfullpost(input_post_id integer) TO anon;
GRANT ALL ON FUNCTION public.getfullpost(input_post_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getfullpost(input_post_id integer) TO service_role;


--
-- TOC entry 3797 (class 0 OID 0)
-- Dependencies: 435
-- Name: FUNCTION getnearestevents(input_location point); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getnearestevents(input_location point) TO anon;
GRANT ALL ON FUNCTION public.getnearestevents(input_location point) TO authenticated;
GRANT ALL ON FUNCTION public.getnearestevents(input_location point) TO service_role;


--
-- TOC entry 3798 (class 0 OID 0)
-- Dependencies: 429
-- Name: FUNCTION getrecenteventposts(input_event_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getrecenteventposts(input_event_id integer) TO anon;
GRANT ALL ON FUNCTION public.getrecenteventposts(input_event_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getrecenteventposts(input_event_id integer) TO service_role;


--
-- TOC entry 3799 (class 0 OID 0)
-- Dependencies: 430
-- Name: FUNCTION getrecenteventpostsfromuser(input_event_id integer, input_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getrecenteventpostsfromuser(input_event_id integer, input_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.getrecenteventpostsfromuser(input_event_id integer, input_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getrecenteventpostsfromuser(input_event_id integer, input_user_id integer) TO service_role;


--
-- TOC entry 3800 (class 0 OID 0)
-- Dependencies: 434
-- Name: FUNCTION getuserevents(input_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getuserevents(input_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.getuserevents(input_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getuserevents(input_user_id integer) TO service_role;


--
-- TOC entry 3801 (class 0 OID 0)
-- Dependencies: 432
-- Name: FUNCTION getuserfollowinglist(input_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getuserfollowinglist(input_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.getuserfollowinglist(input_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getuserfollowinglist(input_user_id integer) TO service_role;


--
-- TOC entry 3802 (class 0 OID 0)
-- Dependencies: 431
-- Name: FUNCTION getuserlikes(input_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getuserlikes(input_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.getuserlikes(input_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getuserlikes(input_user_id integer) TO service_role;


--
-- TOC entry 3803 (class 0 OID 0)
-- Dependencies: 423
-- Name: FUNCTION getuserposts(input_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getuserposts(input_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.getuserposts(input_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getuserposts(input_user_id integer) TO service_role;


--
-- TOC entry 3804 (class 0 OID 0)
-- Dependencies: 424
-- Name: FUNCTION reversecascadedeleteposts(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reversecascadedeleteposts() TO anon;
GRANT ALL ON FUNCTION public.reversecascadedeleteposts() TO authenticated;
GRANT ALL ON FUNCTION public.reversecascadedeleteposts() TO service_role;


--
-- TOC entry 3805 (class 0 OID 0)
-- Dependencies: 280
-- Name: TABLE events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.events TO anon;
GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;


--
-- TOC entry 3807 (class 0 OID 0)
-- Dependencies: 288
-- Name: SEQUENCE events_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.events_id_seq TO anon;
GRANT ALL ON SEQUENCE public.events_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.events_id_seq TO service_role;


--
-- TOC entry 3808 (class 0 OID 0)
-- Dependencies: 281
-- Name: TABLE post_comments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_comments TO anon;
GRANT ALL ON TABLE public.post_comments TO authenticated;
GRANT ALL ON TABLE public.post_comments TO service_role;


--
-- TOC entry 3810 (class 0 OID 0)
-- Dependencies: 289
-- Name: SEQUENCE post_comments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.post_comments_id_seq TO anon;
GRANT ALL ON SEQUENCE public.post_comments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.post_comments_id_seq TO service_role;


--
-- TOC entry 3811 (class 0 OID 0)
-- Dependencies: 282
-- Name: TABLE post_event_author; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_event_author TO anon;
GRANT ALL ON TABLE public.post_event_author TO authenticated;
GRANT ALL ON TABLE public.post_event_author TO service_role;


--
-- TOC entry 3812 (class 0 OID 0)
-- Dependencies: 283
-- Name: TABLE post_likes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_likes TO anon;
GRANT ALL ON TABLE public.post_likes TO authenticated;
GRANT ALL ON TABLE public.post_likes TO service_role;


--
-- TOC entry 3814 (class 0 OID 0)
-- Dependencies: 291
-- Name: SEQUENCE post_likes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.post_likes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.post_likes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.post_likes_id_seq TO service_role;


--
-- TOC entry 3816 (class 0 OID 0)
-- Dependencies: 290
-- Name: SEQUENCE posteventauthor_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.posteventauthor_id_seq TO anon;
GRANT ALL ON SEQUENCE public.posteventauthor_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.posteventauthor_id_seq TO service_role;


--
-- TOC entry 3817 (class 0 OID 0)
-- Dependencies: 284
-- Name: TABLE posts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.posts TO anon;
GRANT ALL ON TABLE public.posts TO authenticated;
GRANT ALL ON TABLE public.posts TO service_role;


--
-- TOC entry 3819 (class 0 OID 0)
-- Dependencies: 292
-- Name: SEQUENCE posts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.posts_id_seq TO anon;
GRANT ALL ON SEQUENCE public.posts_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.posts_id_seq TO service_role;


--
-- TOC entry 3820 (class 0 OID 0)
-- Dependencies: 285
-- Name: TABLE user_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_events TO anon;
GRANT ALL ON TABLE public.user_events TO authenticated;
GRANT ALL ON TABLE public.user_events TO service_role;


--
-- TOC entry 3822 (class 0 OID 0)
-- Dependencies: 293
-- Name: SEQUENCE user_events_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.user_events_id_seq TO anon;
GRANT ALL ON SEQUENCE public.user_events_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.user_events_id_seq TO service_role;


--
-- TOC entry 3823 (class 0 OID 0)
-- Dependencies: 294
-- Name: TABLE user_following; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_following TO anon;
GRANT ALL ON TABLE public.user_following TO authenticated;
GRANT ALL ON TABLE public.user_following TO service_role;


--
-- TOC entry 3825 (class 0 OID 0)
-- Dependencies: 295
-- Name: SEQUENCE user_following_user_following_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.user_following_user_following_id_seq TO anon;
GRANT ALL ON SEQUENCE public.user_following_user_following_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.user_following_user_following_id_seq TO service_role;


--
-- TOC entry 3826 (class 0 OID 0)
-- Dependencies: 297
-- Name: TABLE user_messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_messages TO anon;
GRANT ALL ON TABLE public.user_messages TO authenticated;
GRANT ALL ON TABLE public.user_messages TO service_role;


--
-- TOC entry 3828 (class 0 OID 0)
-- Dependencies: 296
-- Name: SEQUENCE user_messages_user_message_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.user_messages_user_message_id_seq TO anon;
GRANT ALL ON SEQUENCE public.user_messages_user_message_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.user_messages_user_message_id_seq TO service_role;


--
-- TOC entry 3829 (class 0 OID 0)
-- Dependencies: 286
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- TOC entry 3831 (class 0 OID 0)
-- Dependencies: 287
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO anon;
GRANT ALL ON SEQUENCE public.users_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.users_id_seq TO service_role;


--
-- TOC entry 2379 (class 826 OID 16490)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2380 (class 826 OID 16491)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2378 (class 826 OID 16489)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2382 (class 826 OID 16493)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2377 (class 826 OID 16488)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2381 (class 826 OID 16492)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


-- Completed on 2026-01-06 00:03:45

--
-- PostgreSQL database dump complete
--

