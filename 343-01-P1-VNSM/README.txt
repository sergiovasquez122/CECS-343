CECS 343: Section 01/02  
Project Name: Version Control System - Phase One  
Project Team: Team VNSM  

Project Members:

Victor Rodriguez: victor.rodriguez02@student.csulb.edu  
Nam Tran: nam.tran01@student.csulb.edu  
Sergio Vasquez: sergio.vasquez01@csulb.student.edu  
Megan Visnaw: megan.visnaw@student.csulb.edu  

--------------------------------------------------------------------------------

Introduction:

This is the first part of our VCS (Version Control System) project. It only
implements an initial use case: Create Repository. It also makes a number of
simplifying assumptions in order to get to working software quickly.


--------------------------------------------------------------------------------
Contents:

app.js.txt  
index.html  

--------------------------------------------------------------------------------
External requirements:

Node.js  
Express.js   

--------------------------------------------------------------------------------
Building Instructions and Installing External Dependencies:

Install [NodeJs](https://nodejs.org/en/download/) (the latest version is 12.18.3 as of 08/14/20)

Open a CLI and switch (cd) to the directory location of where you extracted the .zip

Enter the command

    mv app.js.txt app.js

to rename the app.js.txt back to a javascript file

Setup the project to use Node via Node's package
by entering this command

    npm init

Press the ENTER key for each prompt except for the choice "entry point: ", which instead, you will change to "app.js"

Then when asked, "Is this okay?" enter "yes"

Now enter the commands

    npm install express --save
    npm install body-parser --save

Run the app 'website' on your machine. Type the command:

    node app.js

In your browser, go to the website at

    http://localhost:3000/

--------------------------------------------------------------------------------

Sample invocation and result:

Initialize repository: createRepo sourceDirectory targetDirectory (both arguments given as absolute paths)

example:

on a linux machine with user name 'sergio'

    createRepo /home/sergio/mypt/ /home/sergio/repo/mypt_project/

on a window machine with user name 'megpe'

    createRepo /Users/megpe/mypt/ /Users/megpe/repo/test1/

--------------------------------------------------------------------------------

Features:
Create repositories.

--------------------------------------------------------------------------------

BUGS / WARNINGS:

No error handling has been done for the program.  
ENOENT: attempting to access a file not found in the directory / path  
EMFILE: attempting to open a file with too many files inside


--------------------------------------------------------------------------------
