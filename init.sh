#!/bin/sh

cd /root/app
node server.js &

while [[ true ]]; do
    /bin/bash
done
