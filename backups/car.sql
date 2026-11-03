--
-- PostgreSQL database dump
--

\restrict n6hZhyr17Kh74q641vAk5TuSgNnRj6CXqfd4Ve2BfQL8nF2xbanRrWaZdeVMt4I

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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

ALTER TABLE IF EXISTS ONLY public.post_related DROP CONSTRAINT IF EXISTS post_related_related_id_posts_id_fk;
ALTER TABLE IF EXISTS ONLY public.post_related DROP CONSTRAINT IF EXISTS post_related_post_id_posts_id_fk;
ALTER TABLE IF EXISTS ONLY public.post_categories DROP CONSTRAINT IF EXISTS post_categories_post_id_posts_id_fk;
ALTER TABLE IF EXISTS ONLY public.post_categories DROP CONSTRAINT IF EXISTS post_categories_category_id_categories_id_fk;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_post_id_posts_id_fk;
ALTER TABLE IF EXISTS ONLY public.cars DROP CONSTRAINT IF EXISTS cars_brand_id_brands_id_fk;
DROP INDEX IF EXISTS public.posts_status_published_at_idx;
DROP INDEX IF EXISTS public.comments_post_status_idx;
DROP INDEX IF EXISTS public.cars_brand_idx;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_slug_unique;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_pkey;
ALTER TABLE IF EXISTS ONLY public.post_related DROP CONSTRAINT IF EXISTS post_related_post_id_related_id_pk;
ALTER TABLE IF EXISTS ONLY public.post_categories DROP CONSTRAINT IF EXISTS post_categories_post_id_category_id_pk;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_slug_unique;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.cars DROP CONSTRAINT IF EXISTS cars_slug_unique;
ALTER TABLE IF EXISTS ONLY public.cars DROP CONSTRAINT IF EXISTS cars_pkey;
ALTER TABLE IF EXISTS ONLY public.brands DROP CONSTRAINT IF EXISTS brands_slug_unique;
ALTER TABLE IF EXISTS ONLY public.brands DROP CONSTRAINT IF EXISTS brands_pkey;
ALTER TABLE IF EXISTS ONLY drizzle.__drizzle_migrations DROP CONSTRAINT IF EXISTS __drizzle_migrations_pkey;
ALTER TABLE IF EXISTS public.posts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cars ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.brands ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS drizzle.__drizzle_migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.settings;
DROP SEQUENCE IF EXISTS public.posts_id_seq;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.post_related;
DROP TABLE IF EXISTS public.post_categories;
DROP SEQUENCE IF EXISTS public.comments_id_seq;
DROP TABLE IF EXISTS public.comments;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public.cars_id_seq;
DROP TABLE IF EXISTS public.cars;
DROP SEQUENCE IF EXISTS public.brands_id_seq;
DROP TABLE IF EXISTS public.brands;
DROP SEQUENCE IF EXISTS drizzle.__drizzle_migrations_id_seq;
DROP TABLE IF EXISTS drizzle.__drizzle_migrations;
DROP TYPE IF EXISTS public.post_status;
DROP TYPE IF EXISTS public.comment_status;
DROP TYPE IF EXISTS public.car_condition;
DROP SCHEMA IF EXISTS drizzle;
--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: car_condition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.car_condition AS ENUM (
    'new',
    'used'
);


--
-- Name: comment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.comment_status AS ENUM (
    'pending',
    'approved',
    'spam'
);


--
-- Name: post_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.post_status AS ENUM (
    'draft',
    'published'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id integer NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    english_name text DEFAULT ''::text NOT NULL,
    intro text DEFAULT ''::text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    logo_url text,
    color text DEFAULT '#1d4ed8'::text NOT NULL,
    faqs jsonb DEFAULT '[]'::jsonb NOT NULL,
    meta_title text DEFAULT ''::text NOT NULL,
    meta_description text DEFAULT ''::text NOT NULL,
    robots_index boolean DEFAULT true NOT NULL,
    robots_follow boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: cars; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cars (
    id integer NOT NULL,
    slug text NOT NULL,
    brand_id integer NOT NULL,
    name text NOT NULL,
    year integer NOT NULL,
    condition public.car_condition DEFAULT 'new'::public.car_condition NOT NULL,
    mileage integer DEFAULT 0 NOT NULL,
    price bigint NOT NULL,
    min_down_percent integer DEFAULT 30 NOT NULL,
    gearbox text DEFAULT 'اتوماتیک'::text NOT NULL,
    fuel text DEFAULT 'بنزین'::text NOT NULL,
    color text DEFAULT '#e5e7eb'::text NOT NULL,
    image_url text,
    image_alt text DEFAULT ''::text NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    weekly_views integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cars_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cars_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cars_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cars_id_seq OWNED BY public.cars.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    author_name text NOT NULL,
    author_email text DEFAULT ''::text NOT NULL,
    content text NOT NULL,
    status public.comment_status DEFAULT 'pending'::public.comment_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: post_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_categories (
    post_id integer NOT NULL,
    category_id integer NOT NULL
);


--
-- Name: post_related; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_related (
    post_id integer NOT NULL,
    related_id integer NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    excerpt text DEFAULT ''::text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    cover_image_url text,
    cover_image_alt text DEFAULT ''::text NOT NULL,
    status public.post_status DEFAULT 'draft'::public.post_status NOT NULL,
    published_at timestamp with time zone,
    reading_minutes integer DEFAULT 1 NOT NULL,
    meta_title text DEFAULT ''::text NOT NULL,
    meta_description text DEFAULT ''::text NOT NULL,
    canonical_url text DEFAULT ''::text NOT NULL,
    robots_index boolean DEFAULT true NOT NULL,
    robots_follow boolean DEFAULT true NOT NULL,
    allow_comments boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: cars id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cars ALTER COLUMN id SET DEFAULT nextval('public.cars_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	ff19c800accfa555dd98df593ddcf1e5ce773e0e7fa12ef8baef7e49297f66a6	1793635099508
2	6c582484c7900e75108bd12506a134fceef37e770b2104de0ac2b539d9c861fa	1793638080455
3	4542425120173f483672c74c3321d8ce78af517f91b41587831729dbc24eeea1	1793698738188
4	13063c21a09d325cad98dc0226f872fa7dad462b9946928d4b4ea662ecbc9f1c	1793698739677
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brands (id, slug, name, english_name, intro, content, logo_url, color, faqs, meta_title, meta_description, robots_index, robots_follow, is_active, "position", created_at, updated_at) FROM stdin;
1	iran-khodro	ایران‌خودرو	Iran Khodro	خرید اقساطی محصولات ایران‌خودرو مثل پژو ۲۰۷، تارا و دنا پلاس با پیش‌پرداخت کم و تحویل سریع.	<h2>چرا خرید اقساطی ایران‌خودرو؟</h2><p>ایران‌خودرو بزرگ‌ترین خودروساز کشور است و قطعات و خدمات پس از فروش محصولاتش در همه شهرها در دسترس است. همین موضوع باعث می‌شود خودروهای این برند ارزش خود را در بازار خوب حفظ کنند و برای خرید اقساطی گزینه‌ای مطمئن باشند.</p><p>در خودرو قسطی می‌توانید محصولات ایران‌خودرو را بدون ضامن، فقط با چک صیادی و با بازپرداخت ۱۲ تا ۴۸ ماهه خریداری کنید.</p>	\N	#1d4ed8	[]			t	t	t	1	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
3	modiran-khodro	مدیران‌خودرو	Modiran Khodro	خرید اقساطی شاسی‌بلندها و سواری‌های مدیران‌خودرو با شرایط شفاف و پیش‌پرداخت مناسب.	<h2>خرید اقساطی محصولات مدیران‌خودرو</h2><p>مدیران‌خودرو با محصولات ام‌وی‌ام، به‌ویژه شاسی‌بلندهای خانواده X، سهم بزرگی از بازار خودروهای مونتاژی دارد. این خودروها را می‌توانید با اقساط ثابت ماهانه و سند به نام خودتان خریداری کنید.</p>	\N	#b91c1c	[]			t	t	t	3	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
4	kerman-motor	کرمان موتور	Kerman Motor	خرید اقساطی محصولات کرمان موتور با بازپرداخت منعطف و سند به نام خریدار از روز اول.	<h2>خرید اقساطی کرمان موتور</h2><p>کرمان موتور با محصولات کی‌ام‌سی، از شاسی‌بلند تا وانت، گزینه‌های متنوعی برای خانواده‌ها و کسب‌وکارها دارد. شرایط اقساطی این برند با بازپرداخت منعطف و بدون نیاز به ضامن ارائه می‌شود.</p>	\N	#7c3aed	[]			t	t	t	4	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
5	fownix	فونیکس	Fownix	خرید اقساطی خودروهای فونیکس، از سواری تا شاسی‌بلند، با تحویل فوری مدل‌های موجود.	<h2>خرید اقساطی فونیکس با تحویل فوری</h2><p>فونیکس، برند محصولات چری در گروه مدیران‌خودرو، با خودروهایی مثل تیگو ۷ پرو و آریزو ۶ پرو شناخته می‌شود. مدل‌های موجود فونیکس با تحویل فوری و اقساط تا ۴۸ ماه عرضه می‌شوند.</p>	\N	#c2410c	[]			t	t	t	5	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
6	bahman-motor	بهمن موتور	Bahman Motor	خرید اقساطی محصولات بهمن موتور با پیش‌پرداخت از ۳۰ درصد و اقساط ثابت ماهانه.	<h2>خرید اقساطی بهمن موتور</h2><p>بهمن موتور با محصولات بسترن، از جمله فیدلیتی و دیگنیتی، در بازار شاسی‌بلندها و سواری‌های خانوادگی حضور دارد. این خودروها را با پیش‌پرداخت از ۳۰ درصد و اقساط ثابت ماهانه بخرید.</p>	\N	#0369a1	[]			t	t	t	6	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
2	saipa	سایپا	Saipa	خرید اقساطی خودروهای سایپا مثل شاهین و کوییک، صفر و کارکرده، بدون ضامن و با اقساط تا ۴۸ ماه.	<h2>خرید اقساطی سایپا با پیش‌پرداخت کم</h2><p>محصولات سایپا به دلیل قیمت مناسب و هزینه نگهداری پایین، از پرطرفدارترین گزینه‌ها برای خرید اقساطی هستند. پیش‌پرداخت خودروهای سایپا از ۲۵ درصد قیمت شروع می‌شود.</p><p>علاوه بر خودروهای صفر، خودروهای کارکرده کارشناسی‌شده سایپا هم با شرایط اقساطی عرضه می‌شوند.</p>	\N	#0f766e	[]			t	t	t	2	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:20:43.211+03:30
\.


--
-- Data for Name: cars; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cars (id, slug, brand_id, name, year, condition, mileage, price, min_down_percent, gearbox, fuel, color, image_url, image_alt, tags, weekly_views, is_active, "position", created_at, updated_at) FROM stdin;
1	haima-s7-turbo	1	هایما S7 توربو	1404	used	12000	2400000000	40	اتوماتیک	بنزین	#64748b	\N		{شاسی‌بلند}	6100	t	4	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
2	dena-plus-turbo	1	دنا پلاس توربو	1405	new	0	1550000000	30	اتوماتیک	بنزین	#111827	\N		{"تحویل ۷ روزه"}	9800	t	3	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
3	tara-at	1	تارا اتوماتیک	1405	new	0	1650000000	30	اتوماتیک	بنزین	#1e3a8a	\N		{پرفروش}	15900	t	2	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
4	peugeot-207-at	1	پژو ۲۰۷ اتوماتیک	1405	new	0	1450000000	30	اتوماتیک	بنزین	#e5e7eb	\N		{"تحویل فوری"}	18400	t	1	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
5	quick-r	2	کوییک R	1403	used	25000	780000000	35	دستی	بنزین	#f8fafc	\N		{کارشناسی‌شده}	7300	t	3	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
6	saina-s	2	ساینا S	1405	new	0	820000000	25	دستی	بنزین	#f8fafc	\N		{اقتصادی}	5400	t	2	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
7	shahin-g	2	شاهین G	1405	new	0	1100000000	25	دستی	بنزین	#b91c1c	\N		{اقتصادی}	13200	t	1	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
8	mvm-315-plus	3	ام‌وی‌ام ۳۱۵ پلاس	1404	used	18000	1350000000	35	دستی	بنزین	#0f172a	\N		{کارشناسی‌شده}	4200	t	2	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
9	mvm-x55-pro	3	ام‌وی‌ام X55 پرو	1405	new	0	2850000000	35	اتوماتیک	بنزین	#f1f5f9	\N		{شاسی‌بلند}	14700	t	1	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
10	kmc-t8	4	کی‌ام‌سی T8	1405	new	0	3900000000	40	اتوماتیک	بنزین	#e2e8f0	\N		{وانت}	3900	t	2	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
11	kmc-j7	4	کی‌ام‌سی J7	1405	new	0	2650000000	35	اتوماتیک	بنزین	#334155	\N		{شاسی‌بلند}	11500	t	1	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
12	arrizo-6-pro	5	آریزو ۶ پرو	1405	new	0	2200000000	35	اتوماتیک	بنزین	#1e293b	\N		{سدان}	6800	t	2	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
13	tiggo-7-pro	5	تیگو ۷ پرو	1405	new	0	3100000000	40	اتوماتیک	بنزین	#7f1d1d	\N		{"تحویل فوری"}	12800	t	1	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
14	dignity-prestige	6	دیگنیتی پرستیژ	1405	new	0	3700000000	40	اتوماتیک	بنزین	#111827	\N		{شاسی‌بلند}	5100	t	2	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
15	fidelity-prime	6	فیدلیتی پرایم	1405	new	0	3400000000	40	اتوماتیک	بنزین	#e2e8f0	\N		{"۷ نفره"}	8900	t	1	2026-11-03 13:10:05.76767+03:30	2026-11-03 13:10:05.76767+03:30
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, slug, name, description, created_at) FROM stdin;
4	راهنمای-خرید	راهنمای خرید		2026-11-03 11:07:24.627025+03:30
5	اقساط-و-تسهیلات	اقساط و تسهیلات		2026-11-03 11:07:26.626379+03:30
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comments (id, post_id, author_name, author_email, content, status, created_at) FROM stdin;
\.


--
-- Data for Name: post_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.post_categories (post_id, category_id) FROM stdin;
5	4
5	5
\.


--
-- Data for Name: post_related; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.post_related (post_id, related_id, "position") FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.posts (id, slug, title, excerpt, content, cover_image_url, cover_image_alt, status, published_at, reading_minutes, meta_title, meta_description, canonical_url, robots_index, robots_follow, allow_comments, created_at, updated_at) FROM stdin;
5	راهنمای-کامل-خرید-اقساطی-خودرو-بدون-ضامن	راهنمای کامل خرید اقساطی خودرو بدون ضامن	هر آنچه برای خرید اقساطی خودرو باید بدانید: مدارک لازم، پیش‌پرداخت، مدت بازپرداخت و نکاتی که قبل از امضای قرارداد باید بررسی کنید.	<h2>خرید اقساطی خودرو چیست؟</h2><p>در خرید اقساطی، بخشی از قیمت خودرو را به عنوان پیش‌پرداخت می‌پردازید و باقی مبلغ را در اقساط ماهانه تسویه می‌کنید. این روش برای کسانی مناسب است که نقدینگی کافی برای خرید نقدی ندارند اما درآمد ماهانه منظمی دارند.</p><h2>مدارک لازم برای خرید اقساطی</h2><ul><li><p>کارت ملی و شناسنامه</p></li><li><p>چک صیادی به نام خریدار</p></li><li><p>مدرک محل سکونت</p></li></ul><h2>مقایسه مدت بازپرداخت</h2><p><strong>نکته:</strong> هرچه مدت بازپرداخت طولانی‌تر باشد، قسط ماهانه کمتر و مجموع سود بیشتر می‌شود.</p><table><colgroup><col style="min-width:25px" /><col style="min-width:25px" /><col style="min-width:25px" /></colgroup><tbody><tr><th><p>مدت بازپرداخت</p></th><th><p>قسط ماهانه</p></th><th><p>مجموع سود</p></th></tr><tr><td><p>۱۲ ماه</p></td><td><p>بیشتر</p></td><td><p>کمتر</p></td></tr><tr><td><p>۴۸ ماه</p></td><td><p>کمتر</p></td><td><p>بیشتر</p></td></tr></tbody></table><h3>کدام مدت مناسب‌تر است؟</h3><p>اگر درآمد ثابتی دارید و می‌خواهید هزینه کل کمتر شود، مدت کوتاه‌تر بهتر است. اگر قسط ماهانه برایتان مهم‌تر است، مدت طولانی‌تر را انتخاب کنید.</p><h2>نکات مهم قبل از امضای قرارداد</h2><ol><li><p>مبلغ کل اقساط را با قیمت نقدی مقایسه کنید.</p></li><li><p>زمان دقیق تحویل خودرو را در قرارداد بنویسید.</p></li><li><p>شرایط تسویه زودتر از موعد را بپرسید.</p></li></ol><blockquote><p>قبل از پرداخت پیش‌پرداخت، همه بندهای قرارداد را با دقت بخوانید.</p></blockquote><p>برای دیدن خودروهای قابل خرید اقساطی، بخش <a href="/#popular">خودروهای پرمخاطب</a> را ببینید.</p>	\N		published	2026-11-03 11:07:36.017+03:30	1		راهنمای قدم‌به‌قدم خرید اقساطی خودرو بدون ضامن: مدارک لازم، مقایسه مدت بازپرداخت، پیش‌پرداخت و نکاتی که قبل از امضای قرارداد باید بدانید.		t	t	t	2026-11-03 11:07:36.019312+03:30	2026-11-03 11:11:40.629+03:30
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (key, value, updated_at) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 4, true);


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.brands_id_seq', 6, true);


--
-- Name: cars_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cars_id_seq', 16, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.comments_id_seq', 2, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.posts_id_seq', 6, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: brands brands_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_slug_unique UNIQUE (slug);


--
-- Name: cars cars_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_pkey PRIMARY KEY (id);


--
-- Name: cars cars_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_slug_unique UNIQUE (slug);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: post_categories post_categories_post_id_category_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT post_categories_post_id_category_id_pk PRIMARY KEY (post_id, category_id);


--
-- Name: post_related post_related_post_id_related_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_related
    ADD CONSTRAINT post_related_post_id_related_id_pk PRIMARY KEY (post_id, related_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: posts posts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_unique UNIQUE (slug);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: cars_brand_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cars_brand_idx ON public.cars USING btree (brand_id);


--
-- Name: comments_post_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_post_status_idx ON public.comments USING btree (post_id, status);


--
-- Name: posts_status_published_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX posts_status_published_at_idx ON public.posts USING btree (status, published_at);


--
-- Name: cars cars_brand_id_brands_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_brand_id_brands_id_fk FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE RESTRICT;


--
-- Name: comments comments_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_categories post_categories_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT post_categories_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: post_categories post_categories_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT post_categories_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_related post_related_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_related
    ADD CONSTRAINT post_related_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_related post_related_related_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_related
    ADD CONSTRAINT post_related_related_id_posts_id_fk FOREIGN KEY (related_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict n6hZhyr17Kh74q641vAk5TuSgNnRj6CXqfd4Ve2BfQL8nF2xbanRrWaZdeVMt4I

