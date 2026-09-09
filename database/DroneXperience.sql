--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

-- Started on 2026-09-08 22:18:59

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
-- TOC entry 6 (class 2615 OID 70786)
-- Name: dronexperience_01_normalizada; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA dronexperience_01_normalizada;


ALTER SCHEMA dronexperience_01_normalizada OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 241 (class 1259 OID 70936)
-- Name: accesorio; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.accesorio (
    accesorio_id bigint NOT NULL,
    proveedor_id bigint NOT NULL,
    nombre character varying(120) NOT NULL,
    costo numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.accesorio OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 70935)
-- Name: accesorio_accesorio_id_seq; Type: SEQUENCE; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE dronexperience_01_normalizada.accesorio ALTER COLUMN accesorio_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dronexperience_01_normalizada.accesorio_accesorio_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 243 (class 1259 OID 70948)
-- Name: arriendo; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.arriendo (
    arriendo_id bigint NOT NULL,
    cliente_id bigint NOT NULL,
    operador_id bigint,
    dron_id bigint NOT NULL,
    piloto_id bigint NOT NULL,
    inicio timestamp without time zone NOT NULL,
    devolucion_programada timestamp without time zone NOT NULL,
    devolucion_real timestamp without time zone,
    costo_total numeric(12,2)
);


ALTER TABLE dronexperience_01_normalizada.arriendo OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 71001)
-- Name: arriendo_accesorio; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.arriendo_accesorio (
    arriendo_id bigint NOT NULL,
    accesorio_id bigint NOT NULL,
    cantidad integer DEFAULT 1 NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.arriendo_accesorio OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 70947)
-- Name: arriendo_arriendo_id_seq; Type: SEQUENCE; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE dronexperience_01_normalizada.arriendo ALTER COLUMN arriendo_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dronexperience_01_normalizada.arriendo_arriendo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 245 (class 1259 OID 70986)
-- Name: arriendo_seguro; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.arriendo_seguro (
    arriendo_id bigint NOT NULL,
    seguro_id bigint NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.arriendo_seguro OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 70913)
-- Name: aseguradora; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.aseguradora (
    aseguradora_id bigint NOT NULL,
    razon_social character varying(160) NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.aseguradora OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 70912)
-- Name: aseguradora_aseguradora_id_seq; Type: SEQUENCE; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE dronexperience_01_normalizada.aseguradora ALTER COLUMN aseguradora_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dronexperience_01_normalizada.aseguradora_aseguradora_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 70869)
-- Name: certificacion; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.certificacion (
    certificacion_id bigint NOT NULL,
    piloto_id bigint NOT NULL,
    tipo character varying(10) NOT NULL,
    numero_certificado character varying(60) NOT NULL,
    entidad_emisora character varying(120) NOT NULL,
    fecha_obtencion date NOT NULL,
    fecha_vencimiento date NOT NULL,
    CONSTRAINT certificacion_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['VLOS'::character varying, 'BVLOS'::character varying, 'NOCTURNA'::character varying])::text[])))
);


ALTER TABLE dronexperience_01_normalizada.certificacion OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 70868)
-- Name: certificacion_certificacion_id_seq; Type: SEQUENCE; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE dronexperience_01_normalizada.certificacion ALTER COLUMN certificacion_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dronexperience_01_normalizada.certificacion_certificacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 70788)
-- Name: cliente; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.cliente (
    cliente_id bigint NOT NULL,
    tipo_cliente character varying(12) NOT NULL,
    CONSTRAINT cliente_tipo_cliente_check CHECK (((tipo_cliente)::text = ANY ((ARRAY['INDIVIDUAL'::character varying, 'EMPRESA'::character varying])::text[])))
);


ALTER TABLE dronexperience_01_normalizada.cliente OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 70787)
-- Name: cliente_cliente_id_seq; Type: SEQUENCE; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE dronexperience_01_normalizada.cliente ALTER COLUMN cliente_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dronexperience_01_normalizada.cliente_cliente_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 70794)
-- Name: cliente_individual; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.cliente_individual (
    cliente_id bigint NOT NULL,
    run character varying(12) NOT NULL,
    nombres character varying(100) NOT NULL,
    apellido_paterno character varying(80) NOT NULL,
    apellido_materno character varying(80) NOT NULL,
    direccion character varying(200) NOT NULL,
    comuna character varying(100) NOT NULL,
    region character varying(100) NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.cliente_individual OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 70883)
-- Name: dron; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.dron (
    dron_id bigint NOT NULL,
    identificador character varying(40) NOT NULL,
    marca character varying(80) NOT NULL,
    modelo character varying(80) NOT NULL,
    anio_fabricacion smallint,
    color character varying(60) NOT NULL,
    estado_actual character varying(20) NOT NULL,
    veces_arrendado integer DEFAULT 0 NOT NULL,
    tipo_dron character varying(15) NOT NULL,
    CONSTRAINT dron_tipo_dron_check CHECK (((tipo_dron)::text = ANY ((ARRAY['RECREATIVO'::character varying, 'PROFESIONAL'::character varying])::text[])))
);


ALTER TABLE dronexperience_01_normalizada.dron OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 70882)
-- Name: dron_dron_id_seq; Type: SEQUENCE; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE dronexperience_01_normalizada.dron ALTER COLUMN dron_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dronexperience_01_normalizada.dron_dron_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 233 (class 1259 OID 70902)
-- Name: dron_profesional; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.dron_profesional (
    dron_id bigint NOT NULL,
    resolucion_camara_mp numeric(6,2) NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.dron_profesional OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 70892)
-- Name: dron_recreativo; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.dron_recreativo (
    dron_id bigint NOT NULL,
    autonomia_bateria_min smallint NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.dron_recreativo OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 70845)
-- Name: empleado; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.empleado (
    empleado_id bigint NOT NULL,
    run character varying(12) NOT NULL,
    nombres character varying(100) NOT NULL,
    apellido_paterno character varying(80) NOT NULL,
    apellido_materno character varying(80) NOT NULL,
    direccion character varying(200) NOT NULL,
    comuna character varying(100) NOT NULL,
    region character varying(100) NOT NULL,
    cargo character varying(120) NOT NULL,
    area_trabajo character varying(120),
    fecha_contratacion date NOT NULL,
    renta_base numeric(12,2) NOT NULL,
    bono_por_vuelo numeric(12,2) DEFAULT 0 NOT NULL,
    asignacion_movilizacion numeric(12,2) DEFAULT 0 NOT NULL,
    asignacion_colacion numeric(12,2) DEFAULT 0 NOT NULL,
    CONSTRAINT empleado_renta_base_check CHECK ((renta_base >= (0)::numeric))
);


ALTER TABLE dronexperience_01_normalizada.empleado OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 70844)
-- Name: empleado_empleado_id_seq; Type: SEQUENCE; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE dronexperience_01_normalizada.empleado ALTER COLUMN empleado_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dronexperience_01_normalizada.empleado_empleado_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 70808)
-- Name: empresa; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.empresa (
    cliente_id bigint NOT NULL,
    rut character varying(12) NOT NULL,
    razon_social character varying(160) NOT NULL,
    direccion character varying(200) NOT NULL,
    comuna character varying(100) NOT NULL,
    region character varying(100) NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.empresa OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 71017)
-- Name: historial_estado_arriendo; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.historial_estado_arriendo (
    arriendo_id bigint NOT NULL,
    secuencia smallint NOT NULL,
    tipo_estado character varying(20) NOT NULL,
    fecha_inicio timestamp without time zone NOT NULL,
    fecha_termino timestamp without time zone
);


ALTER TABLE dronexperience_01_normalizada.historial_estado_arriendo OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 70973)
-- Name: inspeccion_arriendo; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.inspeccion_arriendo (
    arriendo_id bigint NOT NULL,
    momento character varying(10) NOT NULL,
    estado_carcasa character varying(500) NOT NULL,
    estado_aspas character varying(500) NOT NULL,
    CONSTRAINT inspeccion_arriendo_momento_check CHECK (((momento)::text = ANY ((ARRAY['INICIAL'::character varying, 'FINAL'::character varying])::text[])))
);


ALTER TABLE dronexperience_01_normalizada.inspeccion_arriendo OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 70833)
-- Name: operador_autorizado; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.operador_autorizado (
    operador_id bigint NOT NULL,
    empresa_id bigint NOT NULL,
    run character varying(12) NOT NULL,
    nombre_completo character varying(180) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_termino date,
    CONSTRAINT operador_autorizado_check CHECK (((fecha_termino IS NULL) OR (fecha_termino >= fecha_inicio)))
);


ALTER TABLE dronexperience_01_normalizada.operador_autorizado OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 70832)
-- Name: operador_autorizado_operador_id_seq; Type: SEQUENCE; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE dronexperience_01_normalizada.operador_autorizado ALTER COLUMN operador_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dronexperience_01_normalizada.operador_autorizado_operador_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 70858)
-- Name: piloto_certificado; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.piloto_certificado (
    empleado_id bigint NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.piloto_certificado OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 70930)
-- Name: proveedor; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.proveedor (
    proveedor_id bigint NOT NULL,
    razon_social character varying(160) NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.proveedor OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 70929)
-- Name: proveedor_proveedor_id_seq; Type: SEQUENCE; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE dronexperience_01_normalizada.proveedor ALTER COLUMN proveedor_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dronexperience_01_normalizada.proveedor_proveedor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 237 (class 1259 OID 70919)
-- Name: seguro_vuelo; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.seguro_vuelo (
    seguro_id bigint NOT NULL,
    aseguradora_id bigint NOT NULL,
    nombre character varying(120) NOT NULL,
    costo numeric(12,2) NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.seguro_vuelo OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 70918)
-- Name: seguro_vuelo_seguro_id_seq; Type: SEQUENCE; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE dronexperience_01_normalizada.seguro_vuelo ALTER COLUMN seguro_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dronexperience_01_normalizada.seguro_vuelo_seguro_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 70822)
-- Name: telefono_cliente; Type: TABLE; Schema: dronexperience_01_normalizada; Owner: postgres
--

CREATE TABLE dronexperience_01_normalizada.telefono_cliente (
    cliente_id bigint NOT NULL,
    telefono character varying(30) NOT NULL
);


ALTER TABLE dronexperience_01_normalizada.telefono_cliente OWNER TO postgres;

--
-- TOC entry 5078 (class 0 OID 70936)
-- Dependencies: 241
-- Data for Name: accesorio; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.accesorio (accesorio_id, proveedor_id, nombre, costo) FROM stdin;
\.


--
-- TOC entry 5080 (class 0 OID 70948)
-- Dependencies: 243
-- Data for Name: arriendo; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.arriendo (arriendo_id, cliente_id, operador_id, dron_id, piloto_id, inicio, devolucion_programada, devolucion_real, costo_total) FROM stdin;
\.


--
-- TOC entry 5083 (class 0 OID 71001)
-- Dependencies: 246
-- Data for Name: arriendo_accesorio; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.arriendo_accesorio (arriendo_id, accesorio_id, cantidad) FROM stdin;
\.


--
-- TOC entry 5082 (class 0 OID 70986)
-- Dependencies: 245
-- Data for Name: arriendo_seguro; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.arriendo_seguro (arriendo_id, seguro_id) FROM stdin;
\.


--
-- TOC entry 5072 (class 0 OID 70913)
-- Dependencies: 235
-- Data for Name: aseguradora; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.aseguradora (aseguradora_id, razon_social) FROM stdin;
\.


--
-- TOC entry 5066 (class 0 OID 70869)
-- Dependencies: 229
-- Data for Name: certificacion; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.certificacion (certificacion_id, piloto_id, tipo, numero_certificado, entidad_emisora, fecha_obtencion, fecha_vencimiento) FROM stdin;
\.


--
-- TOC entry 5056 (class 0 OID 70788)
-- Dependencies: 219
-- Data for Name: cliente; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.cliente (cliente_id, tipo_cliente) FROM stdin;
\.


--
-- TOC entry 5057 (class 0 OID 70794)
-- Dependencies: 220
-- Data for Name: cliente_individual; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.cliente_individual (cliente_id, run, nombres, apellido_paterno, apellido_materno, direccion, comuna, region) FROM stdin;
\.


--
-- TOC entry 5068 (class 0 OID 70883)
-- Dependencies: 231
-- Data for Name: dron; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.dron (dron_id, identificador, marca, modelo, anio_fabricacion, color, estado_actual, veces_arrendado, tipo_dron) FROM stdin;
\.


--
-- TOC entry 5070 (class 0 OID 70902)
-- Dependencies: 233
-- Data for Name: dron_profesional; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.dron_profesional (dron_id, resolucion_camara_mp) FROM stdin;
\.


--
-- TOC entry 5069 (class 0 OID 70892)
-- Dependencies: 232
-- Data for Name: dron_recreativo; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.dron_recreativo (dron_id, autonomia_bateria_min) FROM stdin;
\.


--
-- TOC entry 5063 (class 0 OID 70845)
-- Dependencies: 226
-- Data for Name: empleado; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.empleado (empleado_id, run, nombres, apellido_paterno, apellido_materno, direccion, comuna, region, cargo, area_trabajo, fecha_contratacion, renta_base, bono_por_vuelo, asignacion_movilizacion, asignacion_colacion) FROM stdin;
\.


--
-- TOC entry 5058 (class 0 OID 70808)
-- Dependencies: 221
-- Data for Name: empresa; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.empresa (cliente_id, rut, razon_social, direccion, comuna, region) FROM stdin;
\.


--
-- TOC entry 5084 (class 0 OID 71017)
-- Dependencies: 247
-- Data for Name: historial_estado_arriendo; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.historial_estado_arriendo (arriendo_id, secuencia, tipo_estado, fecha_inicio, fecha_termino) FROM stdin;
\.


--
-- TOC entry 5081 (class 0 OID 70973)
-- Dependencies: 244
-- Data for Name: inspeccion_arriendo; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.inspeccion_arriendo (arriendo_id, momento, estado_carcasa, estado_aspas) FROM stdin;
\.


--
-- TOC entry 5061 (class 0 OID 70833)
-- Dependencies: 224
-- Data for Name: operador_autorizado; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.operador_autorizado (operador_id, empresa_id, run, nombre_completo, fecha_inicio, fecha_termino) FROM stdin;
\.


--
-- TOC entry 5064 (class 0 OID 70858)
-- Dependencies: 227
-- Data for Name: piloto_certificado; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.piloto_certificado (empleado_id) FROM stdin;
\.


--
-- TOC entry 5076 (class 0 OID 70930)
-- Dependencies: 239
-- Data for Name: proveedor; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.proveedor (proveedor_id, razon_social) FROM stdin;
\.


--
-- TOC entry 5074 (class 0 OID 70919)
-- Dependencies: 237
-- Data for Name: seguro_vuelo; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.seguro_vuelo (seguro_id, aseguradora_id, nombre, costo) FROM stdin;
\.


--
-- TOC entry 5059 (class 0 OID 70822)
-- Dependencies: 222
-- Data for Name: telefono_cliente; Type: TABLE DATA; Schema: dronexperience_01_normalizada; Owner: postgres
--

COPY dronexperience_01_normalizada.telefono_cliente (cliente_id, telefono) FROM stdin;
\.


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 240
-- Name: accesorio_accesorio_id_seq; Type: SEQUENCE SET; Schema: dronexperience_01_normalizada; Owner: postgres
--

SELECT pg_catalog.setval('dronexperience_01_normalizada.accesorio_accesorio_id_seq', 1, false);


--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 242
-- Name: arriendo_arriendo_id_seq; Type: SEQUENCE SET; Schema: dronexperience_01_normalizada; Owner: postgres
--

SELECT pg_catalog.setval('dronexperience_01_normalizada.arriendo_arriendo_id_seq', 1, false);


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 234
-- Name: aseguradora_aseguradora_id_seq; Type: SEQUENCE SET; Schema: dronexperience_01_normalizada; Owner: postgres
--

SELECT pg_catalog.setval('dronexperience_01_normalizada.aseguradora_aseguradora_id_seq', 1, false);


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 228
-- Name: certificacion_certificacion_id_seq; Type: SEQUENCE SET; Schema: dronexperience_01_normalizada; Owner: postgres
--

SELECT pg_catalog.setval('dronexperience_01_normalizada.certificacion_certificacion_id_seq', 1, false);


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 218
-- Name: cliente_cliente_id_seq; Type: SEQUENCE SET; Schema: dronexperience_01_normalizada; Owner: postgres
--

SELECT pg_catalog.setval('dronexperience_01_normalizada.cliente_cliente_id_seq', 1, false);


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 230
-- Name: dron_dron_id_seq; Type: SEQUENCE SET; Schema: dronexperience_01_normalizada; Owner: postgres
--

SELECT pg_catalog.setval('dronexperience_01_normalizada.dron_dron_id_seq', 1, false);


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 225
-- Name: empleado_empleado_id_seq; Type: SEQUENCE SET; Schema: dronexperience_01_normalizada; Owner: postgres
--

SELECT pg_catalog.setval('dronexperience_01_normalizada.empleado_empleado_id_seq', 1, false);


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 223
-- Name: operador_autorizado_operador_id_seq; Type: SEQUENCE SET; Schema: dronexperience_01_normalizada; Owner: postgres
--

SELECT pg_catalog.setval('dronexperience_01_normalizada.operador_autorizado_operador_id_seq', 1, false);


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 238
-- Name: proveedor_proveedor_id_seq; Type: SEQUENCE SET; Schema: dronexperience_01_normalizada; Owner: postgres
--

SELECT pg_catalog.setval('dronexperience_01_normalizada.proveedor_proveedor_id_seq', 1, false);


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 236
-- Name: seguro_vuelo_seguro_id_seq; Type: SEQUENCE SET; Schema: dronexperience_01_normalizada; Owner: postgres
--

SELECT pg_catalog.setval('dronexperience_01_normalizada.seguro_vuelo_seguro_id_seq', 1, false);


--
-- TOC entry 4879 (class 2606 OID 70941)
-- Name: accesorio accesorio_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.accesorio
    ADD CONSTRAINT accesorio_pkey PRIMARY KEY (accesorio_id);


--
-- TOC entry 4887 (class 2606 OID 71006)
-- Name: arriendo_accesorio arriendo_accesorio_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.arriendo_accesorio
    ADD CONSTRAINT arriendo_accesorio_pkey PRIMARY KEY (arriendo_id, accesorio_id);


--
-- TOC entry 4881 (class 2606 OID 70952)
-- Name: arriendo arriendo_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.arriendo
    ADD CONSTRAINT arriendo_pkey PRIMARY KEY (arriendo_id);


--
-- TOC entry 4885 (class 2606 OID 70990)
-- Name: arriendo_seguro arriendo_seguro_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.arriendo_seguro
    ADD CONSTRAINT arriendo_seguro_pkey PRIMARY KEY (arriendo_id, seguro_id);


--
-- TOC entry 4873 (class 2606 OID 70917)
-- Name: aseguradora aseguradora_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.aseguradora
    ADD CONSTRAINT aseguradora_pkey PRIMARY KEY (aseguradora_id);


--
-- TOC entry 4861 (class 2606 OID 70876)
-- Name: certificacion certificacion_numero_certificado_key; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.certificacion
    ADD CONSTRAINT certificacion_numero_certificado_key UNIQUE (numero_certificado);


--
-- TOC entry 4863 (class 2606 OID 70874)
-- Name: certificacion certificacion_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.certificacion
    ADD CONSTRAINT certificacion_pkey PRIMARY KEY (certificacion_id);


--
-- TOC entry 4843 (class 2606 OID 70800)
-- Name: cliente_individual cliente_individual_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.cliente_individual
    ADD CONSTRAINT cliente_individual_pkey PRIMARY KEY (cliente_id);


--
-- TOC entry 4845 (class 2606 OID 70802)
-- Name: cliente_individual cliente_individual_run_key; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.cliente_individual
    ADD CONSTRAINT cliente_individual_run_key UNIQUE (run);


--
-- TOC entry 4841 (class 2606 OID 70793)
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (cliente_id);


--
-- TOC entry 4865 (class 2606 OID 70891)
-- Name: dron dron_identificador_key; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.dron
    ADD CONSTRAINT dron_identificador_key UNIQUE (identificador);


--
-- TOC entry 4867 (class 2606 OID 70889)
-- Name: dron dron_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.dron
    ADD CONSTRAINT dron_pkey PRIMARY KEY (dron_id);


--
-- TOC entry 4871 (class 2606 OID 70906)
-- Name: dron_profesional dron_profesional_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.dron_profesional
    ADD CONSTRAINT dron_profesional_pkey PRIMARY KEY (dron_id);


--
-- TOC entry 4869 (class 2606 OID 70896)
-- Name: dron_recreativo dron_recreativo_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.dron_recreativo
    ADD CONSTRAINT dron_recreativo_pkey PRIMARY KEY (dron_id);


--
-- TOC entry 4855 (class 2606 OID 70855)
-- Name: empleado empleado_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.empleado
    ADD CONSTRAINT empleado_pkey PRIMARY KEY (empleado_id);


--
-- TOC entry 4857 (class 2606 OID 70857)
-- Name: empleado empleado_run_key; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.empleado
    ADD CONSTRAINT empleado_run_key UNIQUE (run);


--
-- TOC entry 4847 (class 2606 OID 70814)
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (cliente_id);


--
-- TOC entry 4849 (class 2606 OID 70816)
-- Name: empresa empresa_rut_key; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.empresa
    ADD CONSTRAINT empresa_rut_key UNIQUE (rut);


--
-- TOC entry 4889 (class 2606 OID 71021)
-- Name: historial_estado_arriendo historial_estado_arriendo_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.historial_estado_arriendo
    ADD CONSTRAINT historial_estado_arriendo_pkey PRIMARY KEY (arriendo_id, secuencia);


--
-- TOC entry 4883 (class 2606 OID 70980)
-- Name: inspeccion_arriendo inspeccion_arriendo_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.inspeccion_arriendo
    ADD CONSTRAINT inspeccion_arriendo_pkey PRIMARY KEY (arriendo_id, momento);


--
-- TOC entry 4853 (class 2606 OID 70838)
-- Name: operador_autorizado operador_autorizado_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.operador_autorizado
    ADD CONSTRAINT operador_autorizado_pkey PRIMARY KEY (operador_id);


--
-- TOC entry 4859 (class 2606 OID 70862)
-- Name: piloto_certificado piloto_certificado_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.piloto_certificado
    ADD CONSTRAINT piloto_certificado_pkey PRIMARY KEY (empleado_id);


--
-- TOC entry 4877 (class 2606 OID 70934)
-- Name: proveedor proveedor_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.proveedor
    ADD CONSTRAINT proveedor_pkey PRIMARY KEY (proveedor_id);


--
-- TOC entry 4875 (class 2606 OID 70923)
-- Name: seguro_vuelo seguro_vuelo_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.seguro_vuelo
    ADD CONSTRAINT seguro_vuelo_pkey PRIMARY KEY (seguro_id);


--
-- TOC entry 4851 (class 2606 OID 70826)
-- Name: telefono_cliente telefono_cliente_pkey; Type: CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.telefono_cliente
    ADD CONSTRAINT telefono_cliente_pkey PRIMARY KEY (cliente_id, telefono);


--
-- TOC entry 4899 (class 2606 OID 70942)
-- Name: accesorio accesorio_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.accesorio
    ADD CONSTRAINT accesorio_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES dronexperience_01_normalizada.proveedor(proveedor_id);


--
-- TOC entry 4907 (class 2606 OID 71012)
-- Name: arriendo_accesorio arriendo_accesorio_accesorio_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.arriendo_accesorio
    ADD CONSTRAINT arriendo_accesorio_accesorio_id_fkey FOREIGN KEY (accesorio_id) REFERENCES dronexperience_01_normalizada.accesorio(accesorio_id);


--
-- TOC entry 4908 (class 2606 OID 71007)
-- Name: arriendo_accesorio arriendo_accesorio_arriendo_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.arriendo_accesorio
    ADD CONSTRAINT arriendo_accesorio_arriendo_id_fkey FOREIGN KEY (arriendo_id) REFERENCES dronexperience_01_normalizada.arriendo(arriendo_id) ON DELETE CASCADE;


--
-- TOC entry 4900 (class 2606 OID 70953)
-- Name: arriendo arriendo_cliente_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.arriendo
    ADD CONSTRAINT arriendo_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES dronexperience_01_normalizada.cliente(cliente_id);


--
-- TOC entry 4901 (class 2606 OID 70963)
-- Name: arriendo arriendo_dron_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.arriendo
    ADD CONSTRAINT arriendo_dron_id_fkey FOREIGN KEY (dron_id) REFERENCES dronexperience_01_normalizada.dron(dron_id);


--
-- TOC entry 4902 (class 2606 OID 70958)
-- Name: arriendo arriendo_operador_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.arriendo
    ADD CONSTRAINT arriendo_operador_id_fkey FOREIGN KEY (operador_id) REFERENCES dronexperience_01_normalizada.operador_autorizado(operador_id);


--
-- TOC entry 4903 (class 2606 OID 70968)
-- Name: arriendo arriendo_piloto_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.arriendo
    ADD CONSTRAINT arriendo_piloto_id_fkey FOREIGN KEY (piloto_id) REFERENCES dronexperience_01_normalizada.piloto_certificado(empleado_id);


--
-- TOC entry 4905 (class 2606 OID 70991)
-- Name: arriendo_seguro arriendo_seguro_arriendo_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.arriendo_seguro
    ADD CONSTRAINT arriendo_seguro_arriendo_id_fkey FOREIGN KEY (arriendo_id) REFERENCES dronexperience_01_normalizada.arriendo(arriendo_id) ON DELETE CASCADE;


--
-- TOC entry 4906 (class 2606 OID 70996)
-- Name: arriendo_seguro arriendo_seguro_seguro_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.arriendo_seguro
    ADD CONSTRAINT arriendo_seguro_seguro_id_fkey FOREIGN KEY (seguro_id) REFERENCES dronexperience_01_normalizada.seguro_vuelo(seguro_id);


--
-- TOC entry 4895 (class 2606 OID 70877)
-- Name: certificacion certificacion_piloto_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.certificacion
    ADD CONSTRAINT certificacion_piloto_id_fkey FOREIGN KEY (piloto_id) REFERENCES dronexperience_01_normalizada.piloto_certificado(empleado_id) ON DELETE CASCADE;


--
-- TOC entry 4890 (class 2606 OID 70803)
-- Name: cliente_individual cliente_individual_cliente_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.cliente_individual
    ADD CONSTRAINT cliente_individual_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES dronexperience_01_normalizada.cliente(cliente_id) ON DELETE CASCADE;


--
-- TOC entry 4897 (class 2606 OID 70907)
-- Name: dron_profesional dron_profesional_dron_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.dron_profesional
    ADD CONSTRAINT dron_profesional_dron_id_fkey FOREIGN KEY (dron_id) REFERENCES dronexperience_01_normalizada.dron(dron_id) ON DELETE CASCADE;


--
-- TOC entry 4896 (class 2606 OID 70897)
-- Name: dron_recreativo dron_recreativo_dron_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.dron_recreativo
    ADD CONSTRAINT dron_recreativo_dron_id_fkey FOREIGN KEY (dron_id) REFERENCES dronexperience_01_normalizada.dron(dron_id) ON DELETE CASCADE;


--
-- TOC entry 4891 (class 2606 OID 70817)
-- Name: empresa empresa_cliente_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.empresa
    ADD CONSTRAINT empresa_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES dronexperience_01_normalizada.cliente(cliente_id) ON DELETE CASCADE;


--
-- TOC entry 4909 (class 2606 OID 71022)
-- Name: historial_estado_arriendo historial_estado_arriendo_arriendo_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.historial_estado_arriendo
    ADD CONSTRAINT historial_estado_arriendo_arriendo_id_fkey FOREIGN KEY (arriendo_id) REFERENCES dronexperience_01_normalizada.arriendo(arriendo_id) ON DELETE CASCADE;


--
-- TOC entry 4904 (class 2606 OID 70981)
-- Name: inspeccion_arriendo inspeccion_arriendo_arriendo_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.inspeccion_arriendo
    ADD CONSTRAINT inspeccion_arriendo_arriendo_id_fkey FOREIGN KEY (arriendo_id) REFERENCES dronexperience_01_normalizada.arriendo(arriendo_id) ON DELETE CASCADE;


--
-- TOC entry 4893 (class 2606 OID 70839)
-- Name: operador_autorizado operador_autorizado_empresa_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.operador_autorizado
    ADD CONSTRAINT operador_autorizado_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES dronexperience_01_normalizada.empresa(cliente_id);


--
-- TOC entry 4894 (class 2606 OID 70863)
-- Name: piloto_certificado piloto_certificado_empleado_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.piloto_certificado
    ADD CONSTRAINT piloto_certificado_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES dronexperience_01_normalizada.empleado(empleado_id) ON DELETE CASCADE;


--
-- TOC entry 4898 (class 2606 OID 70924)
-- Name: seguro_vuelo seguro_vuelo_aseguradora_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.seguro_vuelo
    ADD CONSTRAINT seguro_vuelo_aseguradora_id_fkey FOREIGN KEY (aseguradora_id) REFERENCES dronexperience_01_normalizada.aseguradora(aseguradora_id);


--
-- TOC entry 4892 (class 2606 OID 70827)
-- Name: telefono_cliente telefono_cliente_cliente_id_fkey; Type: FK CONSTRAINT; Schema: dronexperience_01_normalizada; Owner: postgres
--

ALTER TABLE ONLY dronexperience_01_normalizada.telefono_cliente
    ADD CONSTRAINT telefono_cliente_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES dronexperience_01_normalizada.cliente(cliente_id) ON DELETE CASCADE;


-- Completed on 2026-09-08 22:19:00

--
-- PostgreSQL database dump complete
--

