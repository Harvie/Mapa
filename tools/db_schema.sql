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
    name character varying(50) NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    "type" smallint NOT NULL,
    status smallint NOT NULL,
    node_secrecy int NOT NULL DEFAULT 0,
    network int REFERENCES networks(id),
    address text NOT NULL,
    url_photos text,
    url_homepage text,
    url_thread text,
    visibility text,
    people_count smallint,
    people_hide smallint NOT NULL DEFAULT 0,
    machine_count smallint,
    machine_hide smallint NOT NULL DEFAULT 0,
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
    node_secrecy int,
    network int,
    address text,
    url_photos text,
    url_homepage text,
    url_thread text,
    visibility text,
    people_count smallint,
    people_hide smallint,
    machine_count smallint,
    machine_hide smallint,
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
    nominal_speed float,
    real_speed float,
    czf_speed float,
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
    nominal_speed float,
    real_speed float,
    czf_speed float,
    lat1 double precision,
    lng1 double precision,
    lat2 double precision,
    lng2 double precision,
    changed_on timestamp,
    changed_by integer,
    PRIMARY KEY (node1, node2, changed_on, changed_by)
);


--
-- Name: networks; Type: TABLE; Schema: public; Owner: mapa; Tablespace: 
--

CREATE TABLE networks (
    id serial NOT NULL PRIMARY KEY,
    name character varying(50) NOT NULL UNIQUE,
    homepage text NOT NULL
);


--
-- Name: notify; Type: TABLE; Schema: public; Owner: mapa; Tablespace: 
--

CREATE TABLE notify (
    user_id int NOT NULL,
    node_id int NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    radius int NOT NULL,
    email text NOT NULL,
    PRIMARY KEY (user_id, node_id)
);

--
-- Name: mappers; Type: TABLE; Schema: public; Owner: mapa; Tablespace: 
--

CREATE TABLE mappers (
    user_id int NOT NULL UNIQUE,
    area_desc text NOT NULL,
    north double precision NOT NULL,
    west double precision NOT NULL,
    south double precision NOT NULL,
    east double precision NOT NULL,
    global int NOT NULL DEFAULT 0
);

ALTER TABLE links ADD CONSTRAINT links_node1_key UNIQUE (node1, node2);
ALTER TABLE links ADD CHECK(node1 < node2);
ALTER TABLE links ADD CHECK(lat1 <= lat2);

ALTER TABLE mappers ADD CHECK(north > south);
ALTER TABLE mappers ADD CHECK(east > west);

CREATE UNIQUE INDEX nodes_name_lower_key ON nodes(lower(name));
CREATE INDEX nodes_lat_lng_idx ON nodes USING btree (lat, lng);
CREATE INDEX links_node1_idx ON links USING btree (node1);
CREATE INDEX links_node2_idx ON links USING btree (node2);
CREATE INDEX links_points_idx ON links USING btree (lat1, lng1, lat2, lng2);


CREATE OR REPLACE FUNCTION if(boolean,anyelement,anyelement) RETURNS anyelement AS $$
  SELECT CASE WHEN $1 THEN $2 ELSE $3 END;
$$ LANGUAGE sql;


CREATE OR REPLACE FUNCTION older_than(timestamp, interval) RETURNS boolean IMMUTABLE AS $$
  SELECT $1 IS NULL OR NOW() - $1 > $2
$$ LANGUAGE sql;
