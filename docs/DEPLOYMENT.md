# UtsukushiiAI Deployment Guide

This document provides comprehensive deployment instructions for the UtsukushiiAI platform.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Development](#local-development)
4. [Docker Deployment](#docker-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16 GB |
| GPU | None | NVIDIA GPU with 8GB VRAM |
| Storage | 50 GB | 100+ GB SSD |

### Software Requirements

| Software | Version |
|----------|---------|
| Node.js | 20.x LTS |
| Python | 3.11+ |
| Docker | 24.x |
| Docker Compose | 2.x |
| MongoDB | 6.x |
| Redis | 7.x |

---

## Environment Configuration

### Required Environment Variables

#### API Service (.env)

```bash
# Server
NODE_ENV=production
PORT=4000

# Database
MONGODB_URI=mongodb://mongodb:27017/utsukushii
MONGODB_USER=admin
MONGODB_PASSWORD=changeme

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=utsukushii-prod

# Frontend URL
FRONTEND_URL=https://app.utsukushii.ai
```

#### Worker Service (.env)

```bash
# Python
PYTHONUNBUFFERED=1

# Database
MONGODB_URI=mongodb://mongodb:27017/utsukushii

# Redis
REDIS_URL=redis://redis:6379

# Model Paths
MODEL_PATH=/app/models
YOLO_MODEL_PATH=/app/models/yolov12-manga.pt
SAM_MODEL_PATH=/app/models/sam2.pt
MIDAS_MODEL_PATH=/app/models/midas-v3.pt

# GPU
CUDA_VISIBLE_DEVICES=0
```

---

## Local Development

### Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/utsukushii/utsukushii-ai.git
cd utsukushii-ai

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup

```bash
# Frontend
cd apps/web
npm install
npm run dev

# API
cd apps/api
npm install
npm run dev

# Worker
cd apps/worker
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

---

## Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production Build

```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Run production containers
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Compose Production File

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    restart: always
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_PASSWORD}
    networks:
      - utsukushii-network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - utsukushii-network

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    restart: always
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/utsukushii
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis
    networks:
      - utsukushii-network

  worker:
    build:
      context: ./apps/worker
      dockerfile: Dockerfile
    restart: always
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/utsukushii
      - REDIS_URL=redis://redis:6379
    volumes:
      - model_cache:/app/models
    deploy:
      replicas: 2
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    depends_on:
      - mongodb
      - redis
    networks:
      - utsukushii-network
    deploy:
      replicas: 2

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.utsukushii.ai
    networks:
      - utsukushii-network

volumes:
  mongodb_data:
  redis_data:
  model_cache:

networks:
  utsukushii-network:
    driver: bridge
```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes 1.28+
- Helm 3.x
- kubectl configured

### Namespace Setup

```bash
kubectl create namespace utsukushii
```

### Deploy with Helm

```bash
# Add Helm repo
helm repo add utsukushii https://charts.utsukushii.ai
helm repo update

# Install chart
helm install utsukushii utsukushii/utsukushii \
  --namespace utsukushii \
  --set-string image.tag=v1.0.0 \
  --set mongodb.auth.username=admin \
  --set mongodb.auth.password=changeme
```

### Manual K8s Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: utsukushii-api
  namespace: utsukushii
spec:
  replicas: 3
  selector:
    matchLabels:
      app: utsukushii-api
  template:
    metadata:
      labels:
        app: utsukushii-api
    spec:
      containers:
        - name: api
          image: utsukushii/api:latest
          ports:
            - containerPort: 4000
          env:
            - name: NODE_ENV
              value: "production"
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef:
                  name: utsukushii-secrets
                  key: mongodb-uri
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: utsukushii-api
  namespace: utsukushii
spec:
  selector:
    app: utsukushii-api
  ports:
    - port: 80
      targetPort: 4000
  type: ClusterIP
```

### GPU Worker Deployment

```yaml
# k8s/worker-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: utsukushii-worker
  namespace: utsukushii
spec:
  replicas: 2
  selector:
    matchLabels:
      app: utsukushii-worker
  template:
    metadata:
      labels:
        app: utsukushii-worker
    spec:
      containers:
        - name: worker
          image: utsukushii/worker:latest
          env:
            - name: CUDA_VISIBLE_DEVICES
              value: "0"
          resources:
            requests:
              memory: "2Gi"
              cpu: "2"
              nvidia.com/gpu: 1
            limits:
              memory: "4Gi"
              cpu: "4"
              nvidia.com/gpu: 1
      tolerations:
        - key: "nvidia.com/gpu"
          operator: "Exists"
          effect: "NoSchedule"
```

### Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: utsukushii-api-hpa
  namespace: utsukushii
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: utsukushii-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

---

## Cloud Deployment

### AWS EKS

```bash
# Create EKS cluster
eksctl create cluster \
  --name utsukushii-prod \
  --region us-east-1 \
  --nodegroup-name workers \
  --node-type t3.large \
  --nodes 3

# Add GPU nodes
eksctl create nodegroup \
  --cluster utsukushii-prod \
  --name gpu-workers \
  --node-type p3.2xlarge \
  --nodes 2
```

### AWS RDS (MongoDB)

```bash
# Use Atlas or DocumentDB
# Connection string format:
mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority
```

### AWS S3

```bash
# Create buckets
aws s3 mb s3://utsukushii-raw
aws s3 mb s3://utsukushii-exports

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket utsukushii-raw \
  --versioning-configuration Status=Enabled
```

---

## Monitoring

### Prometheus + Grafana

```yaml
# monitoring/prometheus.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'api'
        static_configs:
          - targets: ['utsukushii-api:4000']
      - job_name: 'worker'
        static_configs:
          - targets: ['utsukushii-worker:8000']
```

### Logging

```yaml
# k8s/logging.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: logging
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd.log.pos
      tag kubernetes.*
    </source>
    <match **>
      @type elasticsearch
      hosts elasticsearch.logging.svc:9200
      logstash_format true
    </match>
```

---

## Troubleshooting

### Common Issues

#### Out of Memory

```bash
# Check memory usage
kubectl top pods

# Increase memory limits
kubectl patch deployment utsukushii-worker -p '{"spec":{"template":{"spec":{"containers":[{"name":"worker","resources":{"limits":{"memory":"8Gi"}}}]}}}}'
```

#### GPU Not Available

```bash
# Check NVIDIA device plugin
kubectl get pods -n kube-system | grep nvidia

# Verify GPU availability
kubectl describe node <node-name> | grep nvidia
```

#### Database Connection Issues

```bash
# Check MongoDB connection
kubectl exec -it utsukushii-api-xxx -- sh -c 'nc -zv mongodb 27017'

# View MongoDB logs
kubectl logs -l app=mongodb -n utsukushii
```

### Health Checks

```bash
# API Health
curl https://api.utsukushii.ai/v1/health

# Worker Health
curl http://worker-service:8000/health
```

### Rollback

```bash
# Rollback deployment
kubectl rollout undo deployment/utsukushii-api

# Rollback to specific revision
kubectl rollout undo deployment/utsukushii-api --to-revision=2
```

---

## Security

### TLS/SSL

```yaml
# k8s/ingress-tls.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: utsukushii-ingress
  namespace: utsukushii
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - api.utsukushii.ai
        - app.utsukushii.ai
      secretName: utsukushii-tls
  rules:
    - host: api.utsukushii.ai
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: utsukushii-api
                port:
                  number: 80
```

### Secrets Management

```bash
# Create secrets
kubectl create secret generic utsukushii-secrets \
  --from-literal=mongodb-uri='mongodb://user:pass@host:27017' \
  --from-literal=jwt-secret='your-jwt-secret' \
  --namespace utsukushii
```
