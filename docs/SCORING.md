# Documentation Quality Scoring

This document captures research on Context7's benchmark scoring system and industry approaches to RAG quality evaluation.

## Overview

Context7 uses a **question-based benchmark system** to evaluate documentation quality. After indexing a library, it:
1. Generates synthetic developer questions about the library
2. Tests whether indexed snippets can answer those questions
3. Scores each question/answer pair using LLM judges
4. Computes an average benchmark score for the library

This score indicates how well the documentation covers common developer use cases.

## Context7's Approach

### Question Generation

Context7 uses **Google Search** to dynamically generate "common developer questions" about a library. This approach:
- Targets real-world developer concerns
- Adapts to each library's domain
- Can be customized by library owners
- Works on private repos

Example questions generated for Wonder Logger:
- "Design a Wonder Logger configuration that exports OpenTelemetry traces to Jaeger and sends logs to Grafana Loki"
- "Explain type safety considerations when using environment variable interpolation for boolean values in YAML configuration"

### Scoring Components (c7score)

Context7 uses a **weighted composite score** with 5 components:

| Component | Weight | What it measures |
|-----------|--------|-----------------|
| **Questions Score** | Configurable | How well snippets answer developer queries |
| **LLM Score** | Configurable | Syntax correctness, clarity, uniqueness |
| **Formatting Score** | Configurable | Structural quality, presentation |
| **Metadata Score** | Configurable | Supplementary project information |
| **Initialization Score** | Configurable | Setup-related content quality |

### Evaluation Pipeline

```
Index documentation
       ↓
Generate questions (via Google Search API)
       ↓
For each question:
  → Retrieve relevant snippets
  → Score with jury LLMs (Claude Opus, Gemini Pro)
  → Record individual score (0-100)
       ↓
Average all scores → Library benchmark score
```

### Example Output

From Context7 indexing logs:
```
Scoring question 9/10 with score: 72
  Question: "Design a Wonder Logger configuration that exports to Jaeger and Loki"

Scoring question 10/10 with score: 98
  Question: "Explain type safety for environment variable interpolation in YAML"

Benchmark completed with average score: 89.70
```

## Quality Dimensions

Beyond benchmark scores, Context7 evaluates:

| Dimension | Description |
|-----------|-------------|
| **Source Reputation** | Organization age, repo stars, contributors, referrals |
| **Benchmark Score** | Success answering common product questions |
| **Injection Detection** | Custom model scanning for prompt injection risks |
| **User Feedback** | Community reports of fraudulent/low-quality content |

## Industry Standards

### DataMorgana (SIGIR 2025)

Tool for generating customizable synthetic Q&A benchmarks for RAG applications:
- Configurable user/question categories
- Control over distribution within benchmark
- Two-stage process for efficiency
- High lexical, syntactic, and semantic diversity

### Microsoft BenchmarkQED / AutoQ

Automated RAG benchmarking with synthetic query generation:
- Generates queries across local-to-global spectrum
- Four distinct query classes
- Consistent benchmarking across datasets
- LLM-as-Judge evaluation method

### RAGAS & ARES

Popular open-source RAG evaluation frameworks:
- **RAGAS**: Faithfulness, relevance, context precision metrics
- **ARES**: Fine-tunes lightweight LLM judges, uses prediction-powered inference

### Key Metrics

| Category | Metrics |
|----------|---------|
| **Retrieval** | Precision@k, Recall@k, MRR, nDCG |
| **Generation** | Faithfulness, relevance, citation coverage, hallucination rate |
| **End-to-End** | Correctness, factuality, latency, cost, safety |

## Future Implementation Notes

To implement similar scoring in local Codex7:

1. **Question Generation Options**:
   - Use LLM to generate questions from indexed content
   - Extract questions from documentation headers/FAQs
   - Use web search APIs to find common questions

2. **Scoring Options**:
   - LLM-as-Judge with configurable prompts
   - Semantic similarity between question and retrieved snippets
   - Hybrid approach combining both

3. **Required Infrastructure**:
   - LLM API for question generation and scoring
   - Storage for benchmark results
   - CLI command for running benchmarks

## References

- [Inside Context7's Quality Stack](https://upstash.com/blog/context7-quality)
- [Better Context7 Output Quality with Code Scoring](https://upstash.com/blog/better-context7-output)
- [DataMorgana: Generating Diverse Q&A Benchmarks for RAG](https://arxiv.org/html/2501.12789v1)
- [Microsoft BenchmarkQED](https://www.microsoft.com/en-us/research/blog/benchmarkqed-automated-benchmarking-of-rag-systems/)
- [RAG Evaluation Guide - Evidently AI](https://www.evidentlyai.com/llm-guide/rag-evaluation)
- [Hugging Face RAG Evaluation Cookbook](https://huggingface.co/learn/cookbook/en/rag_evaluation)
