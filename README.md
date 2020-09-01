# muenchen-termin-notifier

## Purpose

The purpose of this package is to help people in Munich getting an appointment in the district's administration. It is not ready yet and must be adjusted for each use case.

## Instructions

1. Check-out/Clone

2. Install the needed npm packages 

    npm install

3. Adjust the e-mail config in the index.js

4. Adjust/extend the use case in the index.js

5. Run with node 

    node .
    
6. For windows users => Add a scheduler task to call Run.bat every X minutes

## What does the script do

1. Download the specified page
2. Looks for available appointements
3. Sends an e-mail if an appointment is found

## TO DO
1. Extend to all use cases
2. Filter by Citizen Office (Bürger Büro)
