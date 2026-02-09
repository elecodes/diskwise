#!/bin/bash
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:$PATH"
export PYTHONPATH="$PYTHONPATH:/Users/elena/Downloads/Diskwise_CLI "
cd "/Users/elena/Downloads/Diskwise_CLI "
python3 diskwise/api/main.py 2>&1 | tee backend_log.txt &
SLEEP_PID=0
sleep 5
kill $SLEEP_PID
cat backend_log.txt
