--
-- PostgreSQL database dump
--

SET client_encoding = 'UTF8';
SET check_function_bodies = false;
SET client_min_messages = warning;
SET search_path = public, pg_catalog;
SET default_tablespace = '';
SET default_with_oids = false;


--
-- Name: nodes; Type: TABLE; Schema: public; Owner: mapa; Tablespace: 
--

CREATE TABLE nodes (
    id serial NOT NULL PRIMARY KEY,
    name character varying(50) NOT NULL UNIQUE,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    "type" smallint NOT NULL,
    status smallint NOT NULL,
    address text NOT NULL,
    url_photos text,
    url_homepage text,
    url_thread text,
    visibility text,
    owner_id integer NOT NULL,
    created_on timestamp,
    created_by integer,
    changed_on timestamp,
    changed_by integer
);


--
-- Name: nodes_history; Type: TABLE; Schema: public; Owner: mapa; Tablespace: 
--

CREATE TABLE nodes_history (
    id integer NOT NULL,
    name text,
    lat double precision,
    lng double precision,
    "type" smallint,
    status smallint,
    address text,
    url_photos text,
    url_homepage text,
    url_thread text,
    visibility text,
    owner_id integer,
    changed_on timestamp NOT NULL,
    changed_by integer NOT NULL,
    PRIMARY KEY (id, changed_on, changed_by)
);


--
-- Name: links; Type: TABLE; Schema: public; Owner: mapa; Tablespace: 
--

CREATE TABLE links (
    node1 integer NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    node2 integer NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    media smallint,
    active smallint DEFAULT 1 NOT NULL,
    backbone smallint DEFAULT 0 NOT NULL,
    secrecy smallint DEFAULT 0 NOT NULL,
    lat1 double precision,
    lng1 double precision,
    lat2 double precision,
    lng2 double precision,
    created_on timestamp,
    created_by integer,
    changed_on timestamp,
    changed_by integer
);


--
-- Name: links_history; Type: TABLE; Schema: public; Owner: mapa; Tablespace: 
--

CREATE TABLE links_history (
    node1 integer NOT NULL,
    node2 integer NOT NULL,
    media smallint,
    active smallint,
    backbone smallint,
    secrecy smallint,
    lat1 double precision,
    lng1 double precision,
    lat2 double precision,
    lng2 double precision,
    changed_on timestamp,
    changed_by integer,
    PRIMARY KEY (node1, node2, changed_on, changed_by)
);


ALTER TABLE links ADD CONSTRAINT links_node1_key UNIQUE (node1, node2);
ALTER TABLE links ADD CHECK(lat1 <= lat2);

CREATE INDEX nodes_lat_lng_idx ON nodes USING btree (lat, lng);
CREATE INDEX links_node1_idx ON links USING btree (node1);
CREATE INDEX links_node2_idx ON links USING btree (node2);
CREATE INDEX links_points_idx ON links USING btree (lat1, lng1, lat2, lng2);
