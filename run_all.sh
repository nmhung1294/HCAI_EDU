#!/bin/bash

# Function to handle interruption (Ctrl+C or kill)
cleanup() {
    echo "[$(date)] Script interrupted. Shutting down." | tee -a logs/uvicorn.log logs/npm.log
    pkill -f "uvicorn app:app"
    pkill -f "npm run dev"
    exit 1
}

# Trap common interrupt signals
trap cleanup SIGINT SIGTERM

# Run uvicorn and log output
(
    echo "[$(date)] Starting Uvicorn..." >> logs/uvicorn.log
    uvicorn app:app --reload >> logs/uvicorn.log 2>&1
    echo "[$(date)] Uvicorn stopped." >> logs/uvicorn.log
) &

# Run npm and log output
(
    echo "[$(date)] Starting npm dev..." >> logs/npm.log
    cd UI && npm run dev >> ../logs/npm.log 2>&1
    echo "[$(date)] npm dev stopped." >> ../logs/npm.log
) &

# Wait for both background jobs
wait
cd ..
# On normal completion
echo "[$(date)] Both servers exited normally." | tee -a logs/uvicorn.log logs/npm.log
