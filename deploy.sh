#!/bin/bash

# Read from Windows environment variables with fallbacks
SERVER=${DEPLOY_SERVER}
USER=${DEPLOY_USER}
PASSWORD=${DEPLOY_PASSWORD}

DIRECTORY="/home/azureuser_printing/PrintaNova"
LOGFILE="deploy.log"

echo "Deployment started at $(date)" > $LOGFILE

ssh $USER@$SERVER << EOF | tee -a $LOGFILE
  echo "Logged into $SERVER"
  cd $DIRECTORY
  echo "Changed directory to $DIRECTORY"
  git pull
  echo "Executed git pull"
  
  # 关闭80端口下的所有进程
  echo $PASSWORD | sudo -S fuser -k 80/tcp
  echo "Closed all processes on port 80"
  
  echo $PASSWORD | sudo -S npm restart
  echo "Executed sudo npm restart"
EOF

echo "Deployment finished at $(date)" >> $LOGFILE