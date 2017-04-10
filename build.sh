#!/bin/bash

sh ./generateCerts.sh
sh ./generateCfgTx.sh
sh ./buildDockerImages.sh