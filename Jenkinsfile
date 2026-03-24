pipeline {
  agent any

  environment {
    DOCKER_REGISTRY = 'docker.io'
    DOCKERHUB_NAMESPACE = 'thieubui'
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
      agent {
        docker {
          image 'node:18'
        }
      }
      parallel {
        stage('Unit Tests') {
          steps {
            dir('app') {
              sh 'node -v'
              sh 'npm -v'
              sh 'npm ci'
              sh 'npm test'
            }
          }
        }
        stage('Mock Lint') {
          steps {
            echo 'Mock lint stage'
          }
        }
      }
    }

    stage('Docker Build') {
      steps {
        script {
          def img = docker.build("${DOCKERHUB_NAMESPACE}/${APP_NAME}:${IMAGE_TAG}", './app')
          env.DOCKER_IMAGE = "${DOCKERHUB_NAMESPACE}/${APP_NAME}:${IMAGE_TAG}"
        }
      }
    }

    stage('Docker Push') {
      steps {
        script {
          docker.withRegistry("https://${DOCKER_REGISTRY}", 'dockerhub-credentials-id') {
            def img = docker.image(env.DOCKER_IMAGE)
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

              # render manifest
              sed -e "s#thieubui/simple-devops-app:latest#${DOCKERHUB_NAMESPACE}/${APP_NAME}:${IMAGE_TAG}#g" \
                k8s/deployment.yaml > k8s/deployment.rendered.yaml

              # validate YAML trước khi apply
              kubectl apply --dry-run=client -f k8s/deployment.rendered.yaml

              # apply
              kubectl apply -f k8s/deployment.rendered.yaml
              kubectl apply -f k8s/service.yaml
              kubectl apply -f k8s/ingress.yaml

              # rollout status (fail fast)
              kubectl rollout status deployment/${APP_NAME}
            '''
          }
        }
      }
    }
  }

  post {
    success {
      echo "✅ Deployment successful: ${DOCKERHUB_NAMESPACE}/${APP_NAME}:${IMAGE_TAG}"
    }
    failure {
      echo "❌ Pipeline failed. Rollback with:"
      echo "kubectl rollout undo deployment/${APP_NAME}"
    }
  }
}