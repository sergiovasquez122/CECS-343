CECS 343, Section 01/02
Project: Version Control System - Phase One
Project Team: Team VNSM

Members:

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

Usage:

Initialize repository: createRepo sourceDirectory targetDirectory (both arguments given as absolute paths)

example:

on a linux machine with user name 'sergio'

    createRepo /home/sergio/mypt/ /home/sergio/repo/mypt_project/

on a window machine with user name 'megpe'

    createRepo /Users/megpe/mypt/ /Users/megpe/repo/test1/

--------------------------------------------------------------------------------

Building Instructions and External Dependencies:

Install [NodeJs](https://nodejs.org/en/download/) (the latest version is 12.18.3 as of 08/14/20)

Open a CLI and switch (cd) to the directory location of the project

Run the app 'website' on your machine. Type the command:

    node app.js

See "App.js listening on port 3000!" in your CLI.

In your browser, go to the website at

    http://localhost:3000/

--------------------------------------------------------------------------------

BUGS:

No error handling has been done for the program.

--------------------------------------------------------------------------------
