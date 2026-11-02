-- One-time setup on a new machine: creates the app role and database.
-- Run as the postgres superuser, choosing a password for car_app:
--   psql -U postgres -h localhost -v app_password=<password> -f scripts/create-db.sql
-- Then put the same password in DATABASE_URL in .env.
CREATE ROLE car_app WITH LOGIN PASSWORD :'app_password';
CREATE DATABASE car OWNER car_app ENCODING 'UTF8' TEMPLATE template0;
