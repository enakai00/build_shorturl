#!/bin/sh

cd /root/app
node server.js &

cat <<EOF >>~/.bashrc
trap 'pkill -TERM node; sleep 3; exit 0' TERM
EOF
exec /bin/bash
