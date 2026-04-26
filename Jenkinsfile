pipeline {
    agent any

    environment {
        // ── Read from Jenkins Credentials Store ──────────────────────
        DOCKERHUB_CREDS    = credentials('dockerhub-credentials')  // provides DOCKERHUB_CREDS_USR + DOCKERHUB_CREDS_PSW
        SONAR_TOKEN        = credentials('sonar-token')
        VERCEL_TOKEN       = credentials('vercel-token')

        // ── Read from Jenkins Global Environment Variables ────────────
        // Set these in: Manage Jenkins → System → Global Properties → Env Variables
        // DOCKERHUB_USERNAME = (set in Jenkins Global Properties)
        // VM2_IP             = (set in Jenkins Global Properties)

        // ── Fixed Config (non-sensitive) ──────────────────────────────
        SONAR_HOST_URL     = 'https://sonarcloud.io'
        SONAR_ORG          = 'samyak-w'
        SONAR_PROJECT_KEY  = 'samyak-w_pulseapi'
        SONAR_SCANNER_HOME = "/home/samyakwaghmare2210/.sonar/sonar-scanner-8.0.1.6346-linux-x64"
    }

    stages {

        stage('Checkout') {
            steps {
                echo '--- Stage 1: Checkout ---'
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                echo '--- Installing backend dependencies ---'
                sh 'cd backend && rm -rf node_modules && npm install'
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                echo '--- Installing frontend dependencies ---'
                sh 'cd frontend && rm -rf node_modules && npm install'
            }
        }

        stage('Run Jest Tests') {
            steps {
                echo '--- Stage 3: Running Jest Tests ---'
                sh 'cd backend && npm run test:ci'
            }
        }

        stage('SonarCloud Analysis') {
            steps {
                echo '--- Stage 4: SonarCloud Code Quality Analysis ---'
                sh """
                    export PATH=${SONAR_SCANNER_HOME}/bin:\$PATH
                    cd backend
                    sonar-scanner \\
                        -Dsonar.organization=${SONAR_ORG} \\
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \\
                        -Dsonar.sources=src \\
                        -Dsonar.tests=tests \\
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \\
                        -Dsonar.host.url=${SONAR_HOST_URL} \\
                        -Dsonar.token=${SONAR_TOKEN}
                """
            }
        }

        stage('Docker Build & Push') {
            steps {
                echo '--- Stage 5: Building and Pushing Docker Image ---'
                sh """
                    echo ${DOCKERHUB_CREDS_PSW} | docker login -u ${DOCKERHUB_CREDS_USR} --password-stdin
                    docker build -t ${DOCKERHUB_CREDS_USR}/pulseapi-backend:latest \\
                                 -t ${DOCKERHUB_CREDS_USR}/pulseapi-backend:${BUILD_NUMBER} \\
                                 ./backend
                    docker push ${DOCKERHUB_CREDS_USR}/pulseapi-backend:latest
                    docker push ${DOCKERHUB_CREDS_USR}/pulseapi-backend:${BUILD_NUMBER}
                    docker logout
                """
            }
        }

        stage('Deploy via Ansible') {
            steps {
                echo '--- Stage 6: Deploying to App Server via Ansible ---'
                sh """
                    DOCKERHUB_USERNAME=${DOCKERHUB_CREDS_USR} \\
                    ansible-playbook -i ansible/inventory.ini ansible/playbook.yml \\
                        --extra-vars "dockerhub_username=${DOCKERHUB_CREDS_USR}"
                """
            }
        }

        stage('Deploy Frontend to Vercel') {
            steps {
                echo '--- Stage 7: Deploying Frontend to Vercel ---'
                sh """
                    cd frontend
                    npx vercel --prod --token=${VERCEL_TOKEN} --yes
                """
            }
        }
    }

    post {
        success {
            echo '========================================='
            echo 'PulseAPI Deployed Successfully!'
            echo "Backend:  http://${VM2_IP}:3001/api/health"
            echo "Jenkins:  http://${VM1_IP}:8080"
            echo 'SonarCloud: https://sonarcloud.io/project/overview?id=samyak-w_pulseapi'
            echo '========================================='
        }
        failure {
            echo 'Pipeline FAILED. Check the stage logs above.'
        }
        always {
            echo "Build #${BUILD_NUMBER} completed."
        }
    }
}
