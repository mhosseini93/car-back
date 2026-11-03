--
-- PostgreSQL database dump
--

\restrict mUqhVrJ93NU8MQO2iywpkWqgBGAJcexqnaZu9Kv9XlgDuZJTpb7LjcFI05GAnu7

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
DROP INDEX IF EXISTS public.posts_status_published_at_idx;
DROP INDEX IF EXISTS public.comments_post_status_idx;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_slug_unique;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_pkey;
ALTER TABLE IF EXISTS ONLY public.post_related DROP CONSTRAINT IF EXISTS post_related_post_id_related_id_pk;
ALTER TABLE IF EXISTS ONLY public.post_categories DROP CONSTRAINT IF EXISTS post_categories_post_id_category_id_pk;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_slug_unique;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY drizzle.__drizzle_migrations DROP CONSTRAINT IF EXISTS __drizzle_migrations_pkey;
ALTER TABLE IF EXISTS public.posts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
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
DROP SEQUENCE IF EXISTS drizzle.__drizzle_migrations_id_seq;
DROP TABLE IF EXISTS drizzle.__drizzle_migrations;
DROP TYPE IF EXISTS public.post_status;
DROP TYPE IF EXISTS public.comment_status;
DROP SCHEMA IF EXISTS drizzle;
--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


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

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


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
-- Name: comments_post_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_post_status_idx ON public.comments USING btree (post_id, status);


--
-- Name: posts_status_published_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX posts_status_published_at_idx ON public.posts USING btree (status, published_at);


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

\unrestrict mUqhVrJ93NU8MQO2iywpkWqgBGAJcexqnaZu9Kv9XlgDuZJTpb7LjcFI05GAnu7

