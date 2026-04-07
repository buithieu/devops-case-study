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
          agent any
          steps {
            echo "Skip test (NodeJS not installed)"
          }
        }

        stage('Lint') {
          agent any
          steps {
            echo 'Run lint here'
          }
        }
      }
    }

    stage('Docker Build') {
      agent any
      steps {
        sh "docker build -t ${IMAGE} ./app"
      }
    }

    stage('Docker Push') {
      agent any
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
      agent any
      steps {
        sh """
          sed -e 's#${DOCKERHUB_NAMESPACE}/${APP_NAME}:latest#${IMAGE}#g' \
            k8s/deployment.yaml > k8s/deployment.rendered.yaml

          kubectl apply -f k8s/deployment.rendered.yaml
          kubectl apply -f k8s/service.yaml
          kubectl apply -f k8s/ingress.yaml

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
    }

    always {
      echo "Pipeline finished"
    }
  }
}