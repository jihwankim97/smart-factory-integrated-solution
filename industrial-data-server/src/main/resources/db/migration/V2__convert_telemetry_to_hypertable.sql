CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable(
    'telemetry_point',
    'collected_at',
    if_not_exists => TRUE
);
