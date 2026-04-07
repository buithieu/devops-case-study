pipeline {
  agent none

  environment {
    DOCKER_REGISTRY     = 'https://index.docker.io/v1/'
    DOCKERHUB_NAMESPACE = 'thieubui'
    APP_NAME            = 'simple-devops-app'
    IMAGE_TAG           = "v${BUILD_NUMBER}"
    IMAGE               = "${DOCKERHUB_NAMESPACE}/${APP_NAME}:${IMAGE_TAG}"
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {

    stage('Checkout') {
      agent any
      steps {
        checkout scm
      }
    }

    stage('Build & Test') {
      parallel {

        stage('Unit Test') {
          agent { label 'nodejs' }
          steps {
            dir('app') {
              sh 'node -v'
              sh 'npm ci'
              sh 'npm test -- --passWithNoTests'
            }
          }
        }

        stage('Lint') {
          agent { label 'nodejs' }
          steps {
            echo 'Run lint here (mock or eslint)'
          }
        }
      }
    }

    stage('Docker Build') {
      agent { label 'docker' }
      steps {
        sh "docker build -t ${IMAGE} ./app"
      }
    }

    stage('Docker Push') {
      agent { label 'docker' }
      steps {
        script {
          docker.withRegistry(DOCKER_REGISTRY, 'dockerhub-credentials-id') {
            sh """
              docker push ${IMAGE}
              docker tag ${IMAGE} ${DOCKERHUB_NAMESPACE}/${APP_NAME}:latest
              docker push ${DOCKERHUB_NAMESPACE}/${APP_NAME}:latest
            """
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      agent { label 'k8s' }
      steps {
        sh """
          echo "Update image version in deployment.yaml"

          sed -e 's#${DOCKERHUB_NAMESPACE}/${APP_NAME}:latest#${IMAGE}#g' \
            k8s/deployment.yaml > k8s/deployment.rendered.yaml

          echo "Apply Kubernetes manifests"

          kubectl apply -f k8s/deployment.rendered.yaml
          kubectl apply -f k8s/service.yaml
          kubectl apply -f k8s/ingress.yaml

          echo "Check rollout status"

          kubectl rollout status deployment/${APP_NAME} --timeout=60s || \
          kubectl rollout undo deployment/${APP_NAME}
        """
      }
    }
  }

  post {
    success {
      echo "✅ Deployment successful: ${IMAGE}"
    }

    failure {
      echo "❌ Pipeline failed!"

      // rollback fallback
      sh """
        echo "Trigger rollback..."
        kubectl rollout undo deployment/${APP_NAME} || true
      """
    }

    always {
      echo "Cleaning workspace..."
      cleanWs()
    }
  }
}