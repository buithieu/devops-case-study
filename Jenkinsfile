pipeline {
  agent any

  environment {
    DOCKER_REGISTRY = 'docker.io'
    DOCKERHUB_NAMESPACE = 'thieubui/simple-devops-app'
    APP_NAME = 'simple-devops-app'
    IMAGE_TAG = "v${env.BUILD_NUMBER}"
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Test') {
      parallel {
        stage('Unit Tests') {
          steps {
            dir('app') {
              sh 'npm ci'
              sh 'npm test'
            }
          }
        }
        stage('Mock Lint') {
          steps {
            echo 'Mock lint stage for demo parallelism'
          }
        }
      }
    }

    stage('Docker Build & Push') {
      steps {
        script {
          docker.withRegistry("https://${DOCKER_REGISTRY}", 'dockerhub-credentials-id') {
            def img = docker.build("${DOCKERHUB_NAMESPACE}/${APP_NAME}:${IMAGE_TAG}", './app')
            img.push()
            img.push('latest')
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          withCredentials([file(credentialsId: 'kubeconfig-cred-id', variable: 'KUBECONFIG_FILE')]) {
            sh '''
              export KUBECONFIG=$KUBECONFIG_FILE
              sed -e "s#your-dockerhub-username/simple-devops-app:latest#${DOCKERHUB_NAMESPACE}/${APP_NAME}:${IMAGE_TAG}#g" \
                k8s/deployment.yaml > k8s/deployment.rendered.yaml
              kubectl apply -f k8s/deployment.rendered.yaml
              kubectl apply -f k8s/service.yaml
              kubectl apply -f k8s/ingress.yaml
            '''
          }
        }
      }
    }
  }

  post {
    success {
      echo "Deployment successful with image tag ${IMAGE_TAG}"
    }
    failure {
      echo "Pipeline failed. Suggested rollback: kubectl rollout undo deployment/simple-devops-app"
    }
  }
}
