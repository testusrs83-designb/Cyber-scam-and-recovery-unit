Render PgBouncer setup (detailed)

Overview
--------
Render-managed Postgres may have connection limits. To avoid connection exhaustion from your NestJS backend and Next.js frontend, deploy PgBouncer as a sidecar or a separate service and point your apps at it.

Options on Render
- Deploy PgBouncer as a private service in the same Render service group as your app. Ensure both app and PgBouncer are in the same internal network.
- Use Render's managed connection pooling if available.

Example PgBouncer Docker service
1. Create a new service `pgbouncer` using the following Dockerfile (or use the official image):

Dockerfile (example)
```
FROM edoburu/pgbouncer
COPY pgbouncer.ini /etc/pgbouncer/pgbouncer.ini
COPY userlist.txt /etc/pgbouncer/userlist.txt
```

pgbouncer.ini (important settings)
```
[databases]
* = host=<RENDER_DB_HOST> port=5432 dbname=<RENDER_DB_NAME>

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
reserve_pool_size = 5
reserve_pool_timeout = 2
server_reset_query = DISCARD ALL
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
```

userlist.txt
```
"dbuser" "md5<md5-hash>"
```

2. Configure your app to use the PgBouncer host and port (e.g. `postgresql://user:pass@pgbouncer.internal:6432/dbname`).

3. Prisma configuration
- Use connection string to PgBouncer in `DATABASE_URL`.
- Use `pgbouncer=true` param if your driver supports it, or set `pool_mode=transaction` in PgBouncer.

4. Important tuning
- Set `default_pool_size` to a value such that (default_pool_size * number_of_instances) < max_connections on the DB.
- Monitor `pg_stat_activity` and PgBouncer stats.

Security
- Make sure PgBouncer service is private and accessible only by your app instances.

Render tips
- Place PgBouncer and your app in the same region and private network. Use internal hostnames Render exposes to services in the same service group.
- If using Render Postgres, ask Render support or consult their docs for recommended pool sizes.
