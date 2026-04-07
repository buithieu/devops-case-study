# DevOps Case Study

## 1. Architecture
- Jenkins Controller + Agents
- Docker for build
- Kubernetes for deployment

## 2. CI/CD Pipeline
1. Checkout code
2. Install dependencies (caching)
3. Run test
4. Build Docker image
5. Push to registry
6. Deploy to Kubernetes

## 3. Deployment Strategy
- Rolling update
- Auto rollback when fail

## 4. How to Run
- docker-compose up
- access Jenkins

## 5. Troubleshooting
- Check Jenkins logs
- Check pod logs (kubectl logs)

## 6. Rollback
kubectl rollout undo deployment/simple-devops-app