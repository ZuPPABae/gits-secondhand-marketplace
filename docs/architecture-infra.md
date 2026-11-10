# Arsitektur Infrastruktur Produksi

> ⚠️ **Catatan**: Bagian ini adalah **rancangan** untuk infrastruktur produksi skala ±100.000 DAU. Infrastruktur ini **tidak dibangun** dalam assignment ini — hanya didokumentasikan sebagai bagian dari desain teknis.

## Diagram

```mermaid
flowchart TD
    User["Pengguna\n(Browser / Mobile)"]
    CF["Cloudflare\nDNS + CDN + WAF"]
    LB["Load Balancer\n(Cloud Provider)"]
    FE1["Frontend Container\nReact SPA (static)"]
    FE2["Frontend Container\nReact SPA (static)"]
    API1["Backend API\nLaravel Container 1"]
    API2["Backend API\nLaravel Container 2"]
    API3["Backend API\nLaravel Container N"]
    PG_PRI["PostgreSQL Primary\n(Managed)"]
    PG_REP["PostgreSQL Read Replica\n(Managed)"]
    REDIS["Redis Cluster\n(Managed)"]
    S3["Object Storage\nS3 / R2"]
    WA["WhatsApp\n(eksternal)"]

    User --> CF
    CF -->|"Static Assets\n(CDN Cache)"| FE1
    CF -->|"API Requests"| LB
    LB --> API1
    LB --> API2
    LB --> API3
    FE1 -.->|"sama"| FE2
    API1 -->|"Write"| PG_PRI
    API2 -->|"Read"| PG_REP
    API3 -->|"Read"| PG_REP
    PG_PRI -->|"Replikasi"| PG_REP
    API1 --> REDIS
    API2 --> REDIS
    API3 --> REDIS
    API1 --> S3
    API2 --> S3
    CF -->|"wa.me link"| WA
```

## Komponen Produksi

| Komponen | Layanan | Keterangan |
|----------|---------|------------|
| CDN / WAF | Cloudflare | Cache static assets, DDoS protection, WAF rules, SSL termination |
| Load Balancer | Cloud provider (GCP/AWS/Azure) | Distribute traffic ke multiple backend instance |
| Backend | Container (Kubernetes / Cloud Run) | Horizontal scaling, auto-scaling berdasarkan CPU/RPS |
| Frontend | Static files via CDN | Build artifact di-upload ke Cloudflare Pages / S3 + CloudFront |
| Database | Managed PostgreSQL | Primary untuk write, read replica untuk query baca |
| Cache | Managed Redis | Session, cache, rate limiting — shared across all backend instances |
| Object Storage | Cloudflare R2 / AWS S3 | Foto listing, CDN delivery via Cloudflare |

## Strategi Scaling

Detail lengkap ada di [`scaling-reliability.md`](./scaling-reliability.md).

- **Backend**: Horizontal scale container, stateless (session di Redis, storage di S3).
- **Database**: Read replica untuk query listing (heavy read workload). Connection pooling via PgBouncer.
- **Cache**: Redis di-share semua instance untuk invalidasi cache yang konsisten.
- **Static assets**: Frontend SPA di-serve via CDN — tidak ada beban ke server untuk HTML/JS/CSS.
- **Search**: `pg_trgm` cukup untuk MVP; migrasi ke Meilisearch/Typesense jika > 1M listing.
