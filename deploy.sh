#!/bin/bash

# 服务器信息
SERVER="52.186.171.143"
USER="azureuser_printing"
PASSWORD="Ekua_1234567"
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