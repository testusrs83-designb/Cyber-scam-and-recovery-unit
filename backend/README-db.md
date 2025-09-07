Database / Realtime connection recommendations

1) Use a single `DATABASE_URL` environment variable for all services. This project expects it in the root `.env`.

2) Connection pooling
- For long-lived servers (NestJS backend): use PgBouncer or Prisma Data Proxy to avoid connection exhaustion.
- On Render, enable the built-in connection pooling or deploy PgBouncer in front of the DB. Example connection string params may be required by your provider.

3) Prisma Data Proxy
- For serverless frontends or many short-lived connections, consider Prisma Data Proxy. It centralizes connections and reduces pool storms.

4) SSL and security
- Render Postgres typically requires SSL. Ensure `?sslmode=require` or the equivalent is present if necessary.

5) Graceful shutdown
- The `PrismaService` in `backend/src/prisma` connects on module init and disconnects on shutdown; that helps avoid orphaned connections.

6) Monitoring
- Add DB connection and query monitoring (pg_stat_activity) and set appropriate max_connections on your DB and pooler.
