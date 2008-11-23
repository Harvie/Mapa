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
    "type" integer NOT NULL,
    status integer NOT NULL,
    address text,
    url_photos text,
    url_homepage text,
    url_thread text,
    visibility text
);


--
-- Name: links; Type: TABLE; Schema: public; Owner: mapa; Tablespace: 
--

CREATE TABLE links (
    node1 integer NOT NULL REFERENCES nodes(id),
    node2 integer NOT NULL REFERENCES nodes(id),
    media integer,
    active integer DEFAULT 1 NOT NULL,
    backbone integer DEFAULT 0 NOT NULL,
    lat1 double precision,
    lng1 double precision,
    lat2 double precision,
    lng2 double precision
);

ALTER TABLE links ADD CONSTRAINT links_node1_key UNIQUE (node1, node2);

CREATE INDEX nodes_lat_lng_idx ON nodes USING btree (lat, lng);
CREATE INDEX links_node1_idx ON links USING btree (node1);
CREATE INDEX links_node2_idx ON links USING btree (node2);
CREATE INDEX links_points_idx ON links USING btree (lat1, lng1, lat2, lng2);
