# 🌐 Codex7 Hosting & Infrastructure Guide

> **Complete infrastructure requirements and cost estimates for self-hosting Codex7 at scale**
>
> Target: 50,000 libraries serving a large audience

---

## 📖 Table of Contents

1. [Scale Assumptions](#-scale-assumptions)
2. [Storage Requirements](#-storage-requirements)
3. [Compute Requirements](#-compute-requirements)
4. [AWS Infrastructure Options](#️-aws-infrastructure-options)
5. [Embedding Costs](#-embedding-generation-costs)
6. [Network & Bandwidth](#-network--bandwidth)
7. [Total Cost Summary](#-total-cost-summary)
8. [Performance Expectations](#-performance-expectations)
9. [Scaling Path](#-scaling-path)
10. [Recommendations](#-recommendations)

---

## 🎯 Scale Assumptions

### MVP vs Production Scale

**Phase 1 MVP (from DATABASE_DESIGN.md):**
- **Libraries:** 100-200
- **Documents:** 75,000 chunks
- **Infrastructure:** t3.medium (4GB RAM, 2 vCPU)
- **Cost:** ~$30/month

**Production Scale (This Document):**
- **Libraries:** 50,000
- **Documents per library:** 500 (average)
- **Total documents:** **25,000,000 chunks**
- **Scale factor:** **~333x larger than MVP**

### Document Distribution

**Assumptions:**
- Popular libraries (React, Next.js, etc.): 1,000-2,000 docs
- Mid-tier libraries: 300-800 docs
- Small libraries: 50-200 docs
- **Average:** 500 docs/library

**Why 500 docs/library?**
- Provides breathing room for growth
- Accounts for multiple versions (5 versions × 100 docs)
- Handles comprehensive documentation sites
- Better to over-provision than under-provision

---

## 💾 Storage Requirements

### Database Storage Breakdown

**Per document (from DATABASE_DESIGN.md):**
- Vector embedding: 6,144 bytes (1536 dimensions × 4 bytes)
- Content: ~500 bytes average
- Metadata: ~500 bytes (title, hash, JSONB, etc.)
- **Total per document: ~7 KB**

**For 25 million documents:**

| Component | Calculation | Size |
|-----------|-------------|------|
| **Raw vector data** | 25M docs × 6 KB | **146 GB** |
| **Document content** | 25M docs × 0.5 KB | **12 GB** |
| **Metadata (JSONB)** | 25M docs × 0.5 KB | **12 GB** |
| **IVFFlat vector index** | ~100% of vector data | **146 GB** |
| **PostgreSQL overhead** | ~20% of total | **60 GB** |
| **Full-text search (GIN)** | ~15% of content | **2 GB** |
| **B-Tree indexes** | ~5% of data | **20 GB** |
| **WAL + temp files** | Buffer space | **50 GB** |
| | | |
| **Total Database Size** | | **~450-500 GB** |

### Storage Recommendations

**Primary Storage:**
- **1 TB gp3 SSD** - Production with headroom
  - 16,000 IOPS provisioned
  - 1,000 MB/s throughput
  - **Cost:** ~$80/month

**Backup Storage:**
- **S3 Standard** - Automated daily snapshots
  - ~500 GB average
  - 30-day retention
  - **Cost:** ~$12/month

**Total Storage Cost:** ~$92/month

---

## 🖥️ Compute Requirements

### Memory (RAM)

**Working set calculation:**

| Component | Requirement | Calculation |
|-----------|-------------|-------------|
| **shared_buffers** | 64 GB | 25% of total RAM (256 GB) |
| **effective_cache_size** | 192 GB | 75% of total RAM |
| **Vector index in memory** | 146 GB | IVFFlat index (hot cache) |
| **Working memory** | 32 GB | Active connections + queries |
| **Application services** | 16 GB | API, MCP, Indexer, Web UI |
| | | |
| **Total RAM Required** | **256 GB** | |

**Why 256 GB?**
- Vector index needs to be in memory for fast queries (<500ms)
- PostgreSQL uses aggressive caching for performance
- Multiple concurrent queries need working memory
- Application services need headroom

### CPU Requirements

| Service | vCPUs | Justification |
|---------|-------|---------------|
| **PostgreSQL** | 16-24 | Vector search is CPU-intensive, parallel queries |
| **Indexer workers** | 8-12 | Embedding generation, document processing |
| **REST API** | 4-8 | Handle 100+ concurrent requests |
| **MCP Server** | 2-4 | Lightweight, mostly I/O-bound |
| **Web UI / nginx** | 2 | Static file serving |
| | | |
| **Total vCPUs** | **32-48** | |

### PostgreSQL Configuration

**Recommended settings for 256 GB RAM:**

```conf
# Memory
shared_buffers = 64GB              # 25% of RAM
effective_cache_size = 192GB       # 75% of RAM
work_mem = 16MB                    # Per operation
maintenance_work_mem = 2GB         # For index builds

# Connections
max_connections = 200              # With pgbouncer
shared_preload_libraries = 'pg_stat_statements,vector'

# Query Planner
random_page_cost = 1.1             # SSD storage
effective_io_concurrency = 200     # SSD

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9
```

**IVFFlat Index Configuration:**

```sql
-- For 25M documents: lists = sqrt(25,000,000) = 5,000
CREATE INDEX idx_documents_embedding ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 5000);

-- Query-time settings for 90-95% recall
SET ivfflat.probes = 20;
```

---

## ☁️ AWS Infrastructure Options

### Option 1: Balanced (Recommended) 🌟

**Best for:** Production deployments with moderate traffic

**Instance:** `r6i.8xlarge` (Memory Optimized)
- **vCPUs:** 32
- **RAM:** 256 GB
- **Network:** Up to 12.5 Gbps
- **EBS Bandwidth:** Up to 10 Gbps
- **Cost:**
  - On-Demand: ~$1,750/month
  - 1-Year Reserved: **~$1,050/month** ✅
  - 3-Year Reserved: ~$700/month

**Storage:**
- **1 TB gp3 SSD**
  - 16,000 IOPS
  - 1,000 MB/s throughput
  - **Cost:** ~$80/month

**Monthly Total:**
- 1-Year Reserved: **~$1,130/month**
- 3-Year Reserved: **~$780/month**

**Annual Total:**
- 1-Year Reserved: **~$13,560/year**
- 3-Year Reserved: **~$9,360/year**

---

### Option 2: High-Performance ⚡

**Best for:** High-traffic deployments, sub-200ms query requirements

**Instance:** `r6i.12xlarge` (More CPU headroom)
- **vCPUs:** 48
- **RAM:** 384 GB (extra headroom)
- **Network:** Up to 18.75 Gbps
- **Cost:**
  - On-Demand: ~$2,620/month
  - 1-Year Reserved: **~$1,575/month**
  - 3-Year Reserved: ~$1,050/month

**Storage:**
- **2 TB gp3 SSD** (double headroom)
  - 20,000 IOPS
  - **Cost:** ~$160/month

**Monthly Total:**
- 1-Year Reserved: **~$1,735/month**
- 3-Year Reserved: **~$1,210/month**

**Annual Total:**
- 1-Year Reserved: **~$20,820/year**
- 3-Year Reserved: **~$14,520/year**

---

### Option 3: Cost-Optimized 💰

**Best for:** Budget-conscious deployments, acceptable latency

**Architecture:** Separate database from application tier

**Database Instance:** `r6i.8xlarge`
- **RAM:** 256 GB
- **Cost (1-year reserved):** ~$1,050/month

**Application Cluster:** 2× `c6i.4xlarge`
- **Total vCPUs:** 32 (16 × 2)
- **Total RAM:** 64 GB
- **Cost (on-demand):** ~$500/month

**Load Balancer:** Application Load Balancer
- **Cost:** ~$30/month

**Storage:** 1 TB gp3 SSD
- **Cost:** ~$80/month

**Monthly Total:** **~$1,660/month**
**Annual Total:** **~$19,920/year**

**Why separate?**
- Can scale API independently of database
- Can use spot instances for API (70% cheaper)
- Better resource utilization

---

### Option 4: Hybrid Hot/Cold Architecture 🔥❄️

**Best for:** Maximum cost savings with acceptable trade-offs

**Hot Tier** (Top 500 most-queried libraries, ~250K docs):
- Instance: `r6i.2xlarge` (64 GB RAM)
- Storage: 100 GB gp3 SSD
- Cost: **~$260/month**
- Query latency: <100ms

**Cold Tier** (Remaining 49,500 libraries, ~24.75M docs):
- Storage: S3 Glacier Instant Retrieval
  - ~500 GB compressed archives
  - Cost: ~$50/month
- Lambda + On-Demand Loading
  - Spin up database only when needed
  - Cost: ~$200/month (usage-based)

**Total Hybrid Cost:** **~$510/month = $6,120/year**

**Trade-offs:**
- Hot libraries: <100ms (instant)
- Cold libraries: 1-3s (acceptable for rare queries)
- 70% cost savings vs full hot deployment

---

## 🔥 Embedding Generation Costs

### Initial Indexing (One-Time)

**OpenAI text-embedding-3-small:**
- **Model:** `text-embedding-3-small` (1536 dimensions)
- **Cost:** $0.02 per 1 million tokens
- **Average chunk:** 512 tokens

**Calculation:**
```
Total tokens = 25M documents × 512 tokens/doc
            = 12.8 billion tokens
            = 12,800 × 1M tokens

Cost = 12,800 × $0.02
     = $256 (one-time)
```

**Initial embedding cost:** **~$256**

### Ongoing Re-Indexing

**Assumptions:**
- 10% of libraries update monthly
- Same 512 tokens/doc average

**Monthly Calculation:**
```
Monthly docs = 25M × 10% = 2.5M documents
Monthly tokens = 2.5M × 512 = 1.28 billion tokens

Cost = 1,280 × $0.02
     = $25.60/month
```

**Monthly re-indexing cost:** **~$26/month**

### Annual Embedding Costs

```
Year 1 = $256 (initial) + ($26 × 12 months)
       = $256 + $312
       = $568
```

**Total Year 1:** **~$570**
**Subsequent Years:** **~$312/year**

### Alternative: Local Embeddings (Future)

**Using transformers.js or similar:**
- **Cost:** $0 (runs on your hardware)
- **Privacy:** 100% offline, no API calls
- **Quality:** ~85-90% of OpenAI quality
- **Compute:** Requires GPU (add ~$200/month for GPU instance)

**Recommendation:** Start with OpenAI for quality, migrate to local if privacy/cost becomes critical.

---

## 🌐 Network & Bandwidth

### Traffic Estimates

**Query Traffic Assumptions:**
- **Peak requests:** 100 requests/second
- **Average response:** 50 KB (formatted documentation)
- **Hours of operation:** 24/7

**Bandwidth Calculation:**
```
Throughput = 100 req/s × 50 KB
          = 5 MB/s
          = 5 MB/s × 86,400 seconds/day
          = 432 GB/day

Monthly = 432 GB × 30 days
       = 12,960 GB
       = ~13 TB/month
```

### AWS Data Transfer Costs

**Without CloudFront (Direct):**
```
First 10 TB:  10,000 GB × $0.09/GB = $900
Next 3 TB:     3,000 GB × $0.085/GB = $255

Total: $1,155/month
```

**With CloudFront CDN (Recommended):**

**Benefits:**
- 60-70% cache hit ratio
- Reduced origin load
- Global edge locations
- Better latency

**Costs:**
```
CloudFront egress:
  First 10 TB:  $0.085/GB = $850
  Next 3 TB:    $0.080/GB = $240

Origin egress (30-40% of traffic):
  ~4 TB × $0.09/GB = $360

Total: $850 + $240 + $360 = $1,450/month
```

**Wait, that's more expensive?**

Actually, with proper caching:
```
CloudFront egress (70% cache hit):
  13 TB × 0.3 (miss rate) = 3.9 TB actual egress
  3.9 TB × $0.085/GB = $332

Origin egress (from EC2 to CloudFront):
  Internal transfer = $0 (same region)

CloudFront monthly fee: $50

Total: $332 + $50 = $382/month
```

**Recommended:** **CloudFront saves ~$773/month** ($1,155 - $382)

---

## 📊 Total Cost Summary

### Year 1 Costs (1-Year Reserved Instances)

| Component | Monthly | Annual | Notes |
|-----------|---------|--------|-------|
| **r6i.8xlarge instance** | $1,050 | $12,600 | 1-year reserved, 256 GB RAM |
| **1 TB gp3 SSD** | $80 | $960 | Database storage, 16K IOPS |
| **S3 backups** | $50 | $600 | 30-day retention |
| **CloudFront + egress** | $382 | $4,584 | CDN + data transfer |
| **OpenAI embeddings** | $48 | $570 | Initial ($256) + monthly ($26) |
| **Monitoring (CloudWatch)** | $30 | $360 | Metrics, logs, alarms |
| | | | |
| **Total Year 1** | **$1,640** | **$19,674** | |

### Year 2+ Costs (Same Config)

| Component | Monthly | Annual | Savings vs Y1 |
|-----------|---------|--------|---------------|
| **r6i.8xlarge** | $1,050 | $12,600 | - |
| **Storage** | $130 | $1,560 | - |
| **Transfer** | $382 | $4,584 | - |
| **OpenAI** | $26 | $312 | **-$258** (no initial index) |
| **Monitoring** | $30 | $360 | - |
| | | | |
| **Total Year 2+** | **$1,618** | **$19,416** | **-$258/year** |

### Optimized Costs (3-Year Reserved)

| Component | Monthly | Annual | Savings vs 1-Year |
|-----------|---------|--------|-------------------|
| **r6i.8xlarge (3-year)** | $700 | $8,400 | **-$4,200** |
| **Storage** | $130 | $1,560 | - |
| **Transfer** | $382 | $4,584 | - |
| **OpenAI** | $48 | $570 | - |
| **Monitoring** | $30 | $360 | - |
| | | | |
| **Optimized Year 1** | **$1,290** | **$15,474** | **-$4,200** |
| **Optimized Year 2+** | **$1,268** | **$15,216** | **-$4,200** |

### 3-Year Total Cost of Ownership

**1-Year Reserved Strategy:**
```
Year 1: $19,674
Year 2: $19,416
Year 3: $19,416

3-Year Total: $58,506
```

**3-Year Reserved Strategy:**
```
Year 1: $15,474
Year 2: $15,216
Year 3: $15,216

3-Year Total: $45,906

Savings: $12,600 (22% cheaper)
```

---

## 🚀 Performance Expectations

### Query Performance

**Vector Similarity Search (25M documents):**

| Metric | Target | Notes |
|--------|--------|-------|
| **p50 latency** | <150ms | Median query time |
| **p95 latency** | <500ms | 95th percentile |
| **p99 latency** | <1,000ms | 99th percentile |
| **Recall** | 90-95% | IVFFlat with probes=20 |
| **Throughput** | 100-200 qps | Queries per second |

**Concurrent Connections:**
- **Max connections:** 200 (with pgbouncer)
- **Pooled connections:** 50 to database
- **Transaction mode:** Best for short queries

**Index Performance:**
```sql
-- Expected query plan
EXPLAIN ANALYZE
SELECT * FROM documents
ORDER BY embedding <=> '[query_vector]'::vector
LIMIT 10;

-- Result:
-- Planning Time: 1.2ms
-- Execution Time: 285ms
-- Index: IVFFlat (lists=5000, probes=20)
```

### Indexing Performance

**Single Worker Throughput:**
- **Document processing:** 50-100 docs/second (parsing, chunking)
- **Embedding generation:** 20 docs/second (OpenAI API limit)
- **Database insertion:** 100 docs/second (batched)
- **Bottleneck:** OpenAI API rate limits

**Parallel Indexing (8 workers):**
```
Effective throughput = 8 workers × 20 docs/sec
                    = 160 docs/sec
                    = 576,000 docs/hour

Initial indexing time = 25M docs / 576k docs/hour
                     = 43.4 hours
                     ≈ 2 days (continuous)
```

**Real-World Estimate:**
- API rate limiting: Add 50% overhead
- Error retries: Add 20% overhead
- **Total time:** **~3-4 days** for initial index

**Cost-Optimized Indexing:**
- Run indexer workers on spot instances (70% cheaper)
- Use 16 workers: **~1.5 days** for initial index
- Cost: ~$50 for entire initial index (vs $200 on-demand)

---

## 🔄 Scaling Path

### Vertical Scaling (Single Instance)

| Documents | Instance | RAM | vCPU | Storage | Monthly Cost |
|-----------|----------|-----|------|---------|--------------|
| 75k (MVP) | t3.medium | 4 GB | 2 | 50 GB | $30 |
| 1M | r6i.large | 16 GB | 2 | 100 GB | $120 |
| 5M | r6i.2xlarge | 64 GB | 8 | 250 GB | $280 |
| 12.5M | r6i.4xlarge | 128 GB | 16 | 500 GB | $565 |
| **25M** ✅ | **r6i.8xlarge** | **256 GB** | **32** | **1 TB** | **$1,130** |
| 50M | r6i.16xlarge | 512 GB | 64 | 2 TB | $2,260 |
| 100M | r6i.24xlarge | 768 GB | 96 | 4 TB | $3,390 |

**When to scale up:**
- Memory usage consistently >85%
- Query latency >500ms p95
- CPU usage >80% sustained
- Adding significantly more documents

### Horizontal Scaling (Multi-Instance)

**When vertical scaling isn't enough (>50M documents):**

**Architecture Changes:**

1. **Read Replicas** (PostgreSQL)
   - Primary: Write operations
   - 2-3 Replicas: Read queries
   - Load balancer distributes reads
   - Cost: +$2,000-3,000/month

2. **Migrate to HNSW Index**
   ```sql
   -- Better for large-scale (>50M docs)
   DROP INDEX idx_documents_embedding;
   CREATE INDEX idx_documents_embedding ON documents
     USING hnsw (embedding vector_cosine_ops);
   ```
   - Better recall (95-99%)
   - Faster queries at scale
   - Slower index builds

3. **Specialized Vector Database** (Optional)
   - Migrate to Qdrant cluster
   - Purpose-built for vector search
   - Better performance at 100M+ scale
   - Cost: +$1,000-2,000/month

4. **Caching Layer**
   - Redis cluster for hot queries
   - 80% cache hit ratio possible
   - Cost: +$200-500/month

**Estimated Cost at 100M+ documents:**
- Infrastructure: $10,000-15,000/month
- Data transfer: $3,000-5,000/month
- **Total:** $13,000-20,000/month

---

## 💡 Recommendations

### For 50K Libraries @ 500 docs/library (25M documents):

#### Recommended Configuration ✅

**Infrastructure:**
- **Instance:** r6i.8xlarge (256 GB RAM, 32 vCPU)
- **Commitment:** 3-year reserved instances (40% savings)
- **Storage:** 1 TB gp3 SSD (16K IOPS)
- **CDN:** CloudFront enabled

**Cost:**
- **Year 1:** ~$15,500/year ($1,290/month)
- **Year 2+:** ~$15,200/year ($1,268/month)
- **3-Year Total:** ~$46,000

**Performance:**
- Query latency: <500ms p95
- Throughput: 100-200 qps
- Recall: 90-95%

#### Optimization Strategies

**1. Use CloudFront CDN** ✅
- Saves ~$770/month on egress
- Improves global latency
- Reduces origin load

**2. Reserved Instances** ✅
- 3-year commitment: 40% savings ($350/month)
- Predictable costs
- Best for long-term deployments

**3. Spot Instances for Indexer** ✅
- 70% cheaper than on-demand
- Perfect for background jobs
- Saves ~$150/month

**4. Monitoring & Alerts** ✅
- Set up CloudWatch alarms for:
  - Memory >85%
  - CPU >80%
  - Query latency >500ms
  - Disk space >75%

#### When NOT to Self-Host

Consider managed alternatives if:
- ❌ Can't commit to 24/7 operations
- ❌ Don't have DevOps expertise
- ❌ Budget <$10,000/year
- ❌ Need <99.9% SLA guarantees

In these cases, wait for codex7.com hosted version (future).

---

## 🎯 Quick Decision Guide

### Small Deployment (<5M docs)
- **Instance:** r6i.2xlarge (64 GB RAM)
- **Cost:** ~$280/month
- **Best for:** Individual teams, 1-10K libraries

### Medium Deployment (5M-15M docs)
- **Instance:** r6i.4xlarge (128 GB RAM)
- **Cost:** ~$565/month
- **Best for:** Organizations, 10K-30K libraries

### Large Deployment (15M-30M docs) ✅ **You are here**
- **Instance:** r6i.8xlarge (256 GB RAM)
- **Cost:** ~$1,130/month (1-year reserved)
- **Best for:** Enterprises, 30K-60K libraries

### Enterprise Deployment (>30M docs)
- **Instance:** r6i.16xlarge+ (512+ GB RAM)
- **Cost:** $2,000+/month
- **Best for:** >60K libraries, high traffic

---

## 📚 Additional Resources

- **Database Design:** See [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- **Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Self-Hosting Guide:** See [SELF_HOSTING.md](./SELF_HOSTING.md) (coming soon)
- **Cost Calculator:** https://calculator.aws/ (customize based on your needs)

---

## 📝 Notes

**These estimates assume:**
- Average 500 documents per library (breathing room)
- Moderate query traffic (100 qps peak)
- Standard documentation size (~512 tokens/chunk)
- US East region pricing
- OpenAI embeddings for quality

**Actual costs may vary based on:**
- Real documentation sizes (could be smaller/larger)
- Query patterns (cache hit ratio)
- Regional pricing differences
- AWS discount programs (volume, enterprise)

**Monitoring is critical:**
- Track actual document sizes
- Measure query latency
- Monitor memory usage
- Adjust infrastructure as needed

---

**Made with 💜 by the Codex7 team**

*"Infrastructure transparency for true open-source hosting"* ✨
