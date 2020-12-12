CECS 343: Section 01/02  
Project Name: Version Control System - Phase Three
Project Team: Team VNSM

Project Members:

Victor Rodriguez: victor.rodriguez02@student.csulb.edu
Nam Tran: nam.tran01@student.csulb.edu
Sergio Vasquez: sergio.vasquez01@csulb.student.edu
Megan Visnaw: megan.visnaw@student.csulb.edu

--------------------------------------------------------------------------------

Introduction:

This is the third part of our VCS (Version Control System) project. Currently
the VCS has implemented the following use cases: Create Repository, Check-out,
Check-in, Listing existing manifest files, Labeling manifest files, Merging the contents 
of a project tree and a repository, Merging the contents of a project tree and a 
repository after a three-way merge . Furthermore, our implementation of said use 
cases has a number of assumptions to ensure a working product in a timely manner.


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
    npm install glob-all --save
    npm install line-reader-sync --save

Run the app 'website' on your machine. Type the command:

    node app.js

In your browser, go to the website at

    http://localhost:3000/

--------------------------------------------------------------------------------

Sample invocation and result:

Initialize repository: createRepo sourceDirectory targetDirectory (both arguments given as absolute paths)

example:

on a linux machine with user name 'sergio'
	Example:
		createRepo /home/sergio/mypt/ /home/sergio/repo/mypt_project/

on a window machine with user name 'megpe'
    	Example:
		createRepo /Users/megpe/mypt/ /Users/megpe/repo/test1/



Update a Repository: checkin source_Directory repo_Directory.
	Example:
		checkin /home/sergio/mypt/  /home/sergio/repo/mypt_project/new_Project/



Clone a Repository: checkout manifest_File_Directory target_Directory
     	Example:
		checkout /home/sergio/repo/mypt_project/new_Project/  /home/sergio/WorkBench/CurrentProject/



Label a manifest file: label source_Directory manifest_Or_Label new_Label
     	Example:
		label /home/sergio/mypt/ newLabel newLabel


Display all manifest files & their lables: label source_Directory
     	Example:
		list /home/sergio/mypt/


Amalgamate the contents of a repository and a project tree.
see siska_merge_test.txt


Combine a repository directory and a project directory after a three way merge. 
see siska_merge_test.txt

--------------------------------------------------------------------------------

Features:
Create repositories.
Update changes to a repository.
Clone / recreate a working repository.
Label a version of a repository.
List all repository versions.
Merge the content of a repository and a project tree's after a three-way merge.
Merge the content of a repository and a project tree. 

--------------------------------------------------------------------------------

BUGS / WARNINGS:

EMFILE: attempting to open a file with too many files inside
TypeError [ERR_INVALID_ARG_TYPE] [ERR_INVALID_ARG_TYPE]: failed in providing required paramaters.
Cannot read property 'then' of undefined: attempting to call a function that doesn't exist. (EX: ccheckin)
ENOENT: no such file or directory, open: Using an incorrect file path / location.
Cannot read property '0' of null: When you plan to checkin and the file that you specified does not exist. 
If you only put one param for labeling it works but you get UNDEFINED as one label:  Not really an error?
[ERR_INVALID_ARG_TYPE] [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string: Only having one location / paramter in functions that require two (createRepo,checkin,checkout, mergeout,mergein)

--------------------------------------------------------------------------------
