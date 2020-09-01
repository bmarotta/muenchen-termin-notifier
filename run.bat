@echo off
cd %~dp0

for /f "skip=1" %%x in ('wmic os get localdatetime') do if not defined MyDate set MyDate=%%x

echo . >> .\logs\kvr.log
echo %MyDate% - Starting KVR >> .\logs\kvr.log
echo . >> .\logs\kvr.log

node . >> .\logs\kvr.log