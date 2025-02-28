#!/bin/bash

# 服务器信息
# Read from Windows environment variables with fallbacks
SERVER=${DEPLOY_SERVER:-%DEPLOY_SERVER%}
# If it's still the Windows variable format, use the default
if [ "$SERVER" = "%DEPLOY_SERVER%" ]; then
  SERVER="52.186.171.143"
fi

USER=${DEPLOY_USER:-%DEPLOY_USER%}
if [ "$USER" = "%DEPLOY_USER%" ]; then
  USER="azureuser_printing"
fi

PASSWORD=${DEPLOY_PASSWORD:-%DEPLOY_PASSWORD%}
if [ "$PASSWORD" = "%DEPLOY_PASSWORD%" ]; then
  PASSWORD="Ekua_1234567"
fi

DIRECTORY="/home/azureuser_printing/PrintaNova"
LOGFILE="deploy.log"

# 开始日志记录
echo "Deployment started at $(date)" > $LOGFILE

# 使用SSH登录并执行命令
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

# 结束日志记录
echo "Deployment finished at $(date)" >> $LOGFILE