--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.0

-- Started on 2026-01-05 16:50:55

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
-- TOC entry 3773 (class 0 OID 0)
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
-- TOC entry 422 (class 1255 OID 27572)
-- Name: createevent(character varying, character varying, point, timestamp without time zone, timestamp without time zone, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
	with rows as (
		insert into "events" (event_name, event_description, event_location,  event_starttime, event_endtime)
		values (eventname, eventdescription, eventlocation, starttime, endtime)
		returning event_id
	)
	insert into user_events (event_id, user_id, is_host)
		values ((select event_id from rows), userid, true);
end;
$$;


ALTER FUNCTION public.createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer) OWNER TO postgres;

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
-- TOC entry 424 (class 1255 OID 30926)
-- Name: getnearestevents(point); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getnearestevents(input_location point) RETURNS TABLE(event_id integer, event_name character varying, event_location point, event_starttime timestamp without time zone, event_endtime timestamp without time zone, event_description character varying)
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
-- TOC entry 431 (class 1255 OID 33145)
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
-- TOC entry 430 (class 1255 OID 33144)
-- Name: getuserevents(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getuserevents(input_user_id integer) RETURNS TABLE(event_id integer, event_name character varying, event_location point, event_starttime timestamp without time zone, event_endtime timestamp without time zone, event_description character varying)
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
-- TOC entry 433 (class 1255 OID 34260)
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
-- TOC entry 432 (class 1255 OID 33152)
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
-- TOC entry 421 (class 1255 OID 27569)
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
-- TOC entry 423 (class 1255 OID 30919)
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
    event_description character varying
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
-- TOC entry 3789 (class 0 OID 0)
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
-- TOC entry 3792 (class 0 OID 0)
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
-- TOC entry 3796 (class 0 OID 0)
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
-- TOC entry 3798 (class 0 OID 0)
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
-- TOC entry 3801 (class 0 OID 0)
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
-- TOC entry 3804 (class 0 OID 0)
-- Dependencies: 293
-- Name: user_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_events_id_seq OWNED BY public.user_events.userevent_id;


--
-- TOC entry 295 (class 1259 OID 27574)
-- Name: user_following; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_following (
    user_following_id integer NOT NULL,
    follower_user_id integer NOT NULL,
    following_user_id integer NOT NULL
);


ALTER TABLE public.user_following OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 27573)
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
-- TOC entry 3807 (class 0 OID 0)
-- Dependencies: 294
-- Name: user_following_user_following_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_following_user_following_id_seq OWNED BY public.user_following.user_following_id;


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
-- TOC entry 3810 (class 0 OID 0)
-- Dependencies: 287
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 3569 (class 2604 OID 17592)
-- Name: events event_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- TOC entry 3570 (class 2604 OID 17594)
-- Name: post_comments postcomment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments ALTER COLUMN postcomment_id SET DEFAULT nextval('public.post_comments_id_seq'::regclass);


--
-- TOC entry 3571 (class 2604 OID 17596)
-- Name: post_event_author posteventauthor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_event_author ALTER COLUMN posteventauthor_id SET DEFAULT nextval('public.posteventauthor_id_seq'::regclass);


--
-- TOC entry 3572 (class 2604 OID 17598)
-- Name: post_likes postlikes_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes ALTER COLUMN postlikes_id SET DEFAULT nextval('public.post_likes_id_seq'::regclass);


--
-- TOC entry 3573 (class 2604 OID 17600)
-- Name: posts post_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN post_id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- TOC entry 3574 (class 2604 OID 17602)
-- Name: user_events userevent_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_events ALTER COLUMN userevent_id SET DEFAULT nextval('public.user_events_id_seq'::regclass);


--
-- TOC entry 3576 (class 2604 OID 27577)
-- Name: user_following user_following_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_following ALTER COLUMN user_following_id SET DEFAULT nextval('public.user_following_user_following_id_seq'::regclass);


--
-- TOC entry 3575 (class 2604 OID 17589)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3752 (class 0 OID 17498)
-- Dependencies: 280
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (event_id, event_name, event_location, event_starttime, event_endtime, event_description) FROM stdin;
1	test event	(3,4)	2025-12-29 15:38:08.963892	2025-12-29 15:38:08.963892	\N
2	second_test_event	(0.2,4)	2025-12-30 11:27:55.91848	2025-12-30 11:27:55.91848	\N
9	Another eevent	(53.22522522522522,-0.5718371824113251)	2026-01-03 15:04:00	2026-03-19 15:04:00	Yep this one is out here alright haha
8	New event to test edit	(53.22522522522522,-0.5417404886002027)	2026-01-02 15:55:00	2026-02-25 15:56:00	Testing an example of a REALLY REALLY really long description just to see what it looks like on the displays!
\.


--
-- TOC entry 3753 (class 0 OID 17503)
-- Dependencies: 281
-- Data for Name: post_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_comments (postcomment_id, postcomment_text, user_id, post_id, post_comment_timestamp) FROM stdin;
1	Test cmoment	12	8	2026-01-03 14:43:51.337661
2	Here's another one	12	8	2026-01-03 14:43:57.045369
3	Yet another comment!	12	8	2026-01-03 14:49:50.907337
4	Yayyy post time!	12	9	2026-01-03 15:05:41.516189
5	This is a comment I am, writing now!	12	8	2026-01-03 15:20:35.02759
6	testing the new comment box	13	9	2026-01-04 11:29:25.851729
7	Here's a comment I guess	12	12	2026-01-05 14:20:17.326633
\.


--
-- TOC entry 3754 (class 0 OID 17508)
-- Dependencies: 282
-- Data for Name: post_event_author; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_event_author (posteventauthor_id, post_id, user_id, event_id) FROM stdin;
3	3	12	8
4	4	12	8
5	5	12	8
6	6	12	8
7	7	12	8
8	8	12	8
9	9	12	9
10	10	12	8
11	11	12	9
12	12	13	9
13	13	12	9
14	14	12	9
15	15	12	9
\.


--
-- TOC entry 3755 (class 0 OID 17511)
-- Dependencies: 283
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_likes (postlikes_id, user_id, post_id) FROM stdin;
7	12	6
10	13	6
11	12	7
12	12	12
\.


--
-- TOC entry 3756 (class 0 OID 17514)
-- Dependencies: 284
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (post_id, post_title, post_body, post_image_url, is_announcement, post_timestamp, post_location) FROM stdin;
3	Test poist	We be testing!		f	2026-01-02 21:00:14.911367	(53.22522522522522,-0.5417404886002027)
4	Here's another post	yayyy		f	2026-01-02 21:04:42.003504	(53.22522522522522,-0.5417404886002027)
5	testtt	testtttttt		f	2026-01-02 22:34:39.067337	(53.22522522522522,-0.5718371824113251)
6	Nmewest post	yeppers		f	2026-01-03 13:03:45.731266	(53.22522522522522,-0.5718371824113251)
7	Wait so wtf is the order returned	Help??		f	2026-01-03 13:03:55.656993	(53.22522522522522,-0.5718371824113251)
8	Do they all go in da middle???	Hjel[p me		f	2026-01-03 13:04:09.041276	(53.22522522522522,-0.5718371824113251)
9	Hyeres a post on this specific event	Here it is i guess		f	2026-01-03 15:05:36.678668	(53.22522522522522,-0.5718371824113251)
10	Here is a new post that I am making now!	Woiw look how cool iti s		f	2026-01-03 15:22:31.159308	(53.22522522522522,-0.5718371824113251)
11	Another one.	Another one.		f	2026-01-04 12:44:51.604663	(53.22522522522522,-0.5718371824113251)
12	Big bomba!	yep		f	2026-01-04 12:45:21.348476	(53.22522522522522,-0.5718371824113251)
13	test post with image	here it is		f	2026-01-05 16:23:00.867648	(53.22522522522522,-0.5718371824113251)
14	Test post with image 2	Here we go hjopefully	https://kfsnhareeqqsrlnwylox.supabase.co/storage/v1/object/public/files/public/12/1767630599022.jpg	f	2026-01-05 16:30:06.519093	(53.22522522522522,-0.5718371824113251)
15	Test post with image 3	Fingers crossed	https://kfsnhareeqqsrlnwylox.supabase.co/storage/v1/object/public/files/public/12/1767630832582.jpg	f	2026-01-05 16:34:01.709081	(53.22522522522522,-0.5718371824113251)
\.


--
-- TOC entry 3757 (class 0 OID 17519)
-- Dependencies: 285
-- Data for Name: user_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_events (userevent_id, event_id, user_id, is_host) FROM stdin;
1	2	1	t
7	8	12	t
8	9	12	t
18	9	13	f
\.


--
-- TOC entry 3767 (class 0 OID 27574)
-- Dependencies: 295
-- Data for Name: user_following; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_following (user_following_id, follower_user_id, following_user_id) FROM stdin;
\.


--
-- TOC entry 3758 (class 0 OID 17522)
-- Dependencies: 286
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password, profile_picture_url, user_status) FROM stdin;
1	testuser	testpw	\N	\N
2	testuser2	testpw	\N	\N
3	testuser3	testpw	\N	\N
4	testuserfromreact	testpw	\N	\N
5	testuserreact2	testpwagain	\N	\N
6	testuserreact2	testpwagain	\N	\N
7	testuserreact15	testpw	\N	\N
8	testuserreact_new2	testpw	\N	\N
9	testuserreact_newbutagain	testpw	\N	\N
10	testuserfromreactemu		\N	\N
11	finaltest		\N	\N
12	test	test		Getting a little silly with it!
13	test2	test2		Testing status
\.


--
-- TOC entry 3812 (class 0 OID 0)
-- Dependencies: 288
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 9, true);


--
-- TOC entry 3813 (class 0 OID 0)
-- Dependencies: 289
-- Name: post_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.post_comments_id_seq', 7, true);


--
-- TOC entry 3814 (class 0 OID 0)
-- Dependencies: 291
-- Name: post_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.post_likes_id_seq', 19, true);


--
-- TOC entry 3815 (class 0 OID 0)
-- Dependencies: 290
-- Name: posteventauthor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posteventauthor_id_seq', 15, true);


--
-- TOC entry 3816 (class 0 OID 0)
-- Dependencies: 292
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 15, true);


--
-- TOC entry 3817 (class 0 OID 0)
-- Dependencies: 293
-- Name: user_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_events_id_seq', 18, true);


--
-- TOC entry 3818 (class 0 OID 0)
-- Dependencies: 294
-- Name: user_following_user_following_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_following_user_following_id_seq', 3, true);


--
-- TOC entry 3819 (class 0 OID 0)
-- Dependencies: 287
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- TOC entry 3578 (class 2606 OID 17528)
-- Name: events event_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT event_id PRIMARY KEY (event_id);


--
-- TOC entry 3586 (class 2606 OID 17530)
-- Name: posts post_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT post_id PRIMARY KEY (post_id);


--
-- TOC entry 3580 (class 2606 OID 17532)
-- Name: post_comments postcomment_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT postcomment_id PRIMARY KEY (postcomment_id);


--
-- TOC entry 3582 (class 2606 OID 17534)
-- Name: post_event_author posteventauthor_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_event_author
    ADD CONSTRAINT posteventauthor_id PRIMARY KEY (posteventauthor_id);


--
-- TOC entry 3584 (class 2606 OID 17536)
-- Name: post_likes postlikes_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT postlikes_id PRIMARY KEY (postlikes_id);


--
-- TOC entry 3590 (class 2606 OID 17538)
-- Name: users user_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_id PRIMARY KEY (user_id);


--
-- TOC entry 3588 (class 2606 OID 17540)
-- Name: user_events userevent_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT userevent_id PRIMARY KEY (userevent_id);


--
-- TOC entry 3602 (class 2620 OID 30920)
-- Name: post_event_author reversecascadedeletepoststrigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER reversecascadedeletepoststrigger AFTER DELETE ON public.post_event_author FOR EACH ROW EXECUTE FUNCTION public.reversecascadedeleteposts();


--
-- TOC entry 3593 (class 2606 OID 30903)
-- Name: post_event_author event_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_event_author
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;


--
-- TOC entry 3598 (class 2606 OID 30921)
-- Name: user_events event_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;


--
-- TOC entry 3600 (class 2606 OID 34287)
-- Name: user_following follower_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_following
    ADD CONSTRAINT follower_user_id FOREIGN KEY (follower_user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3601 (class 2606 OID 34282)
-- Name: user_following following_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_following
    ADD CONSTRAINT following_user_id FOREIGN KEY (following_user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3594 (class 2606 OID 30908)
-- Name: post_event_author post_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_event_author
    ADD CONSTRAINT post_id FOREIGN KEY (post_id) REFERENCES public.posts(post_id) ON DELETE CASCADE;


--
-- TOC entry 3596 (class 2606 OID 34262)
-- Name: post_likes post_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_id FOREIGN KEY (post_id) REFERENCES public.posts(post_id) ON DELETE CASCADE;


--
-- TOC entry 3591 (class 2606 OID 34272)
-- Name: post_comments post_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT post_id FOREIGN KEY (post_id) REFERENCES public.posts(post_id) ON DELETE CASCADE;


--
-- TOC entry 3595 (class 2606 OID 30913)
-- Name: post_event_author user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_event_author
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3597 (class 2606 OID 34267)
-- Name: post_likes user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3592 (class 2606 OID 34277)
-- Name: post_comments user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_comments
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3599 (class 2606 OID 34292)
-- Name: user_events user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3774 (class 0 OID 0)
-- Dependencies: 18
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- TOC entry 3775 (class 0 OID 0)
-- Dependencies: 428
-- Name: FUNCTION createcomment(userid integer, postid integer, comment_text character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.createcomment(userid integer, postid integer, comment_text character varying) TO anon;
GRANT ALL ON FUNCTION public.createcomment(userid integer, postid integer, comment_text character varying) TO authenticated;
GRANT ALL ON FUNCTION public.createcomment(userid integer, postid integer, comment_text character varying) TO service_role;


--
-- TOC entry 3776 (class 0 OID 0)
-- Dependencies: 422
-- Name: FUNCTION createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer) TO anon;
GRANT ALL ON FUNCTION public.createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer) TO authenticated;
GRANT ALL ON FUNCTION public.createevent(eventname character varying, eventdescription character varying, eventlocation point, starttime timestamp without time zone, endtime timestamp without time zone, userid integer) TO service_role;


--
-- TOC entry 3777 (class 0 OID 0)
-- Dependencies: 425
-- Name: FUNCTION createpost(posttitle character varying, postbody character varying, postimageurl character varying, authorid integer, eventid integer, eventlocation point); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.createpost(posttitle character varying, postbody character varying, postimageurl character varying, authorid integer, eventid integer, eventlocation point) TO anon;
GRANT ALL ON FUNCTION public.createpost(posttitle character varying, postbody character varying, postimageurl character varying, authorid integer, eventid integer, eventlocation point) TO authenticated;
GRANT ALL ON FUNCTION public.createpost(posttitle character varying, postbody character varying, postimageurl character varying, authorid integer, eventid integer, eventlocation point) TO service_role;


--
-- TOC entry 3778 (class 0 OID 0)
-- Dependencies: 426
-- Name: FUNCTION geteventposts(input_event_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.geteventposts(input_event_id integer) TO anon;
GRANT ALL ON FUNCTION public.geteventposts(input_event_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.geteventposts(input_event_id integer) TO service_role;


--
-- TOC entry 3779 (class 0 OID 0)
-- Dependencies: 427
-- Name: FUNCTION getfullpost(input_post_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getfullpost(input_post_id integer) TO anon;
GRANT ALL ON FUNCTION public.getfullpost(input_post_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getfullpost(input_post_id integer) TO service_role;


--
-- TOC entry 3780 (class 0 OID 0)
-- Dependencies: 424
-- Name: FUNCTION getnearestevents(input_location point); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getnearestevents(input_location point) TO anon;
GRANT ALL ON FUNCTION public.getnearestevents(input_location point) TO authenticated;
GRANT ALL ON FUNCTION public.getnearestevents(input_location point) TO service_role;


--
-- TOC entry 3781 (class 0 OID 0)
-- Dependencies: 429
-- Name: FUNCTION getrecenteventposts(input_event_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getrecenteventposts(input_event_id integer) TO anon;
GRANT ALL ON FUNCTION public.getrecenteventposts(input_event_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getrecenteventposts(input_event_id integer) TO service_role;


--
-- TOC entry 3782 (class 0 OID 0)
-- Dependencies: 431
-- Name: FUNCTION getrecenteventpostsfromuser(input_event_id integer, input_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getrecenteventpostsfromuser(input_event_id integer, input_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.getrecenteventpostsfromuser(input_event_id integer, input_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getrecenteventpostsfromuser(input_event_id integer, input_user_id integer) TO service_role;


--
-- TOC entry 3783 (class 0 OID 0)
-- Dependencies: 430
-- Name: FUNCTION getuserevents(input_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getuserevents(input_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.getuserevents(input_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getuserevents(input_user_id integer) TO service_role;


--
-- TOC entry 3784 (class 0 OID 0)
-- Dependencies: 433
-- Name: FUNCTION getuserfollowinglist(input_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getuserfollowinglist(input_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.getuserfollowinglist(input_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getuserfollowinglist(input_user_id integer) TO service_role;


--
-- TOC entry 3785 (class 0 OID 0)
-- Dependencies: 432
-- Name: FUNCTION getuserlikes(input_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getuserlikes(input_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.getuserlikes(input_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getuserlikes(input_user_id integer) TO service_role;


--
-- TOC entry 3786 (class 0 OID 0)
-- Dependencies: 421
-- Name: FUNCTION getuserposts(input_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.getuserposts(input_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.getuserposts(input_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.getuserposts(input_user_id integer) TO service_role;


--
-- TOC entry 3787 (class 0 OID 0)
-- Dependencies: 423
-- Name: FUNCTION reversecascadedeleteposts(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reversecascadedeleteposts() TO anon;
GRANT ALL ON FUNCTION public.reversecascadedeleteposts() TO authenticated;
GRANT ALL ON FUNCTION public.reversecascadedeleteposts() TO service_role;


--
-- TOC entry 3788 (class 0 OID 0)
-- Dependencies: 280
-- Name: TABLE events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.events TO anon;
GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;


--
-- TOC entry 3790 (class 0 OID 0)
-- Dependencies: 288
-- Name: SEQUENCE events_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.events_id_seq TO anon;
GRANT ALL ON SEQUENCE public.events_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.events_id_seq TO service_role;


--
-- TOC entry 3791 (class 0 OID 0)
-- Dependencies: 281
-- Name: TABLE post_comments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_comments TO anon;
GRANT ALL ON TABLE public.post_comments TO authenticated;
GRANT ALL ON TABLE public.post_comments TO service_role;


--
-- TOC entry 3793 (class 0 OID 0)
-- Dependencies: 289
-- Name: SEQUENCE post_comments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.post_comments_id_seq TO anon;
GRANT ALL ON SEQUENCE public.post_comments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.post_comments_id_seq TO service_role;


--
-- TOC entry 3794 (class 0 OID 0)
-- Dependencies: 282
-- Name: TABLE post_event_author; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_event_author TO anon;
GRANT ALL ON TABLE public.post_event_author TO authenticated;
GRANT ALL ON TABLE public.post_event_author TO service_role;


--
-- TOC entry 3795 (class 0 OID 0)
-- Dependencies: 283
-- Name: TABLE post_likes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_likes TO anon;
GRANT ALL ON TABLE public.post_likes TO authenticated;
GRANT ALL ON TABLE public.post_likes TO service_role;


--
-- TOC entry 3797 (class 0 OID 0)
-- Dependencies: 291
-- Name: SEQUENCE post_likes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.post_likes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.post_likes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.post_likes_id_seq TO service_role;


--
-- TOC entry 3799 (class 0 OID 0)
-- Dependencies: 290
-- Name: SEQUENCE posteventauthor_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.posteventauthor_id_seq TO anon;
GRANT ALL ON SEQUENCE public.posteventauthor_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.posteventauthor_id_seq TO service_role;


--
-- TOC entry 3800 (class 0 OID 0)
-- Dependencies: 284
-- Name: TABLE posts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.posts TO anon;
GRANT ALL ON TABLE public.posts TO authenticated;
GRANT ALL ON TABLE public.posts TO service_role;


--
-- TOC entry 3802 (class 0 OID 0)
-- Dependencies: 292
-- Name: SEQUENCE posts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.posts_id_seq TO anon;
GRANT ALL ON SEQUENCE public.posts_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.posts_id_seq TO service_role;


--
-- TOC entry 3803 (class 0 OID 0)
-- Dependencies: 285
-- Name: TABLE user_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_events TO anon;
GRANT ALL ON TABLE public.user_events TO authenticated;
GRANT ALL ON TABLE public.user_events TO service_role;


--
-- TOC entry 3805 (class 0 OID 0)
-- Dependencies: 293
-- Name: SEQUENCE user_events_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.user_events_id_seq TO anon;
GRANT ALL ON SEQUENCE public.user_events_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.user_events_id_seq TO service_role;


--
-- TOC entry 3806 (class 0 OID 0)
-- Dependencies: 295
-- Name: TABLE user_following; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_following TO anon;
GRANT ALL ON TABLE public.user_following TO authenticated;
GRANT ALL ON TABLE public.user_following TO service_role;


--
-- TOC entry 3808 (class 0 OID 0)
-- Dependencies: 294
-- Name: SEQUENCE user_following_user_following_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.user_following_user_following_id_seq TO anon;
GRANT ALL ON SEQUENCE public.user_following_user_following_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.user_following_user_following_id_seq TO service_role;


--
-- TOC entry 3809 (class 0 OID 0)
-- Dependencies: 286
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- TOC entry 3811 (class 0 OID 0)
-- Dependencies: 287
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO anon;
GRANT ALL ON SEQUENCE public.users_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.users_id_seq TO service_role;


--
-- TOC entry 2373 (class 826 OID 16490)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2374 (class 826 OID 16491)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2372 (class 826 OID 16489)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2376 (class 826 OID 16493)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2371 (class 826 OID 16488)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2375 (class 826 OID 16492)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


-- Completed on 2026-01-05 16:50:58

--
-- PostgreSQL database dump complete
--

