/*************************************************************************
 * Authors:
 * Victor Rodriguez: victor.rodriguez02@student.csulb.edu
 * Nam Tran: nam.tran01@student.csulb.edu
 * Sergio Vasquez: sergio.vasquez01@csulb.student.edu
 * Megan Visnaw: megan.visnaw@student.csulb.edu
 *
 * Description:
 * This is the backend of the project that provides all the functionality
 * once the user has entered an input.
 */
// Importing necessary libraries
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const os = require("os");
const glob = require('glob');
const line_reader = require('line-reader-sync');
let app = express();

/**
 * gets the time during the call of the function in a human-readable format
 * @returns {Date} A date object that will contain the current date
 */
const getTimeStamp = function (){
    const timestamp = Number(new Date());
    return new Date(timestamp);
}

/**
 * Given a string compute the checksum of all the content
 * @param str the string that checksum will be computed on
 * @returns {number} a number between the range [0, 9999]
 */
function check_sum_of_string(str) {
    let sum = 0;
    let counter = 0;
    const multiplier = [1, 3, 7, 11];
    for (let i = 0; i < str.length; i++) {
        sum += str.codePointAt(i) * multiplier[counter % 4];
        counter = counter + 1;
    }
    return sum % 10000;
}

/**
 * Given the three components specified below, generates the id of the file of the with
 * the form 'Pa-Lb-Cc'
 * where a is the checksum of the file content
 * b is the byte size of th file
 * and c is the check_sum of the relative path
 * @param check_sum_of_file_content
 * @param bytes_in_file
 * @param check_sum_of_relative_path
 */
function artificial_id_generator(check_sum_of_file_content, bytes_in_file, check_sum_of_relative_path){
    return "P" + check_sum_of_file_content + "-L" +  bytes_in_file + "-C" + check_sum_of_relative_path;
}

/**
 * Given an absolute path, continously create directories that are not available in the path
 * code example was taken https://stackoverflow.com/questions/31645738/how-to-create-full-path-with-nodes-fs-mkdirsync
 * @param targetDir the absolute path of the paths to be create if they don't exist.
 * @param isRelativeToScript boolean value that directory is currently relative to the script
 */
function mkdirRecursive(targetDir, { isRelativeToScript = false } = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';

    return targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
        } catch (err) {
            if (err.code === 'EEXIST') { // curDir already exists!
                return curDir;
            }

            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
                throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }

            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
                throw err; // Throw if it's just the last created dir.
            }
        }

        return curDir;
    }, initDir);
}

/**
 * List all the manifest files and if they have a label that alongside with it
 * @param source_directory the directory to find the manifest files. no error-checking is done to check if manifest actually exists
 * @returns a string that contains the manifest files and labels in key-value pair if possible
 */
let list = function(source_directory){
    let result = "";
    let hash_table = load_labeling(source_directory);
    let options = {'cwd' : path.resolve(source_directory) , 'dot' : true, 'root' : path.resolve(source_directory)};
    let files = glob.sync(".man-+([0-9]).txt", options).toString().split(",");
    for(let i = 0;i < files.length;i++){
        result += files[i] + "\n";
    }
    for(const key of hash_table.keys())
        result += key.toString() + " " + hash_table.get(key) + "\n";
    return result;
}

/**
 * load the labeling of the manifest
 * @param source_directory the directory to load the labeling
 * @returns {Map<any, any>} map with key value pair
 */
let load_labeling = function(source_directory){
    let file_path = path.posix.resolve(source_directory, ".labeling.txt");
    let hash_table = new Map();
    try {
        if(fs.existsSync(file_path)){
            let lrs = new line_reader(file_path);
            let lines = lrs.toLines();
            for(let i = 0;i < lines.length;i++){
                let tokens = lines[i].split(" ");
                hash_table.set(tokens[0], tokens[1]);
            }
        }
    } catch (err){
        return hash_table;
    }
    return hash_table;
}

/**
 * writes a new labeling of a manifest_file to the .labeling.txt file
 * @param source_directory
 * @param manifest_or_label
 * @param new_labeling
 */
let label_command = function(source_directory, manifest_or_label, new_labeling){
    let map = load_labeling(source_directory);
    try{
        let value = "";
        if(map.has(manifest_or_label)){
            value = map.get(manifest_or_label);
        } else {
            value = manifest_or_label;
        }
        fs.appendFileSync(path.posix.resolve(source_directory, ".labeling.txt"), new_labeling + " " + value + os.EOL);
    } catch (err){
        throw err;
    }
}

/**
 * give the absolute path to a manifest file/label recreate a project tree in the desired target directory
 * @param manifest_file_name_absolute_path the absolute path of a manifest file/label
 * @param target_directory the location where to recreate the project tree
 * @param command that user supplied
 */
let checkout = function(manifest_file_name_absolute_path, target_directory, command){
    let directory_path = path.posix.dirname(manifest_file_name_absolute_path);
    let manifest_file_name = path.posix.basename(manifest_file_name_absolute_path);
    let hash_table = load_labeling(directory_path);
    // was supplied a label not a manifest file
    if(hash_table.has(manifest_file_name)){
        manifest_file_name = hash_table.get(manifest_file_name);
    }
    // make the target directory if it does not exist
    mkdirRecursive(target_directory);
    // write the manifest file
    fs.writeFileSync(path.posix.join(target_directory, manifest_file_name), getTimeStamp() + "\n" + command + "\n");
    let file_path = path.posix.join(directory_path, manifest_file_name);
    if(fs.existsSync(file_path)){
        let lrs = new line_reader(file_path);
        let lines = lrs.toLines();
        // ignore the first two lines
        for(let i = 2;i < lines.length;i++){
            let tokens = lines[i].split(" ");
            let file_to_copy = tokens[0];
            let file_relative = tokens[1];
            let dir_name = path.posix.dirname(file_relative);
            let file_name = path.posix.basename(file_relative);
            // make the directory if it does not exist
            mkdirRecursive(path.join(target_directory, dir_name))
            // copy the file to teh respective place in the target directory
            fs.copyFileSync(path.join(directory_path, file_to_copy), path.join(target_directory, dir_name, file_name));
            // append the portion to the manifest file
            fs.appendFileSync(path.posix.join(target_directory, manifest_file_name), lines[i] + "\n");
        }
    }
}

/**
 * Does a depth-first search traversal computing the check sum of files, the relative path from the source and the byte size of the files
 * and then creating an artificial id for the file and copying it into the target directory.
 * based of of the 1st method in the link https://dustinpfister.github.io/2018/07/20/nodejs-ways-to-walk-a-file-system/
 * @param dir the current directory that is being operated on in the recursive call, given in absolute path
 * @param source_directory the directory in which the first recursive call is taken place, given in absolute path
 * @param target_directory the directory in which the all the files of the source directory will go to.
 * @param manifest_file_name name of the file that will contain the snapshot information
 */
let clone = function (dir, source_directory, target_directory, manifest_file_name) {
    // get the contents of dir
    fs.readdir(dir, (e, items) => {
        // for each item in the contents
        items.forEach((item) => {
            // get the item path
            let itemPath = path.posix.join(dir, item);
            // get the stats of the item
            fs.stat(itemPath, (e, stats) => {
                // use stats to find out
                // if the current item is a dir
                if (stats.isDirectory() && item[0] !== ".") {
                    // if so walk that too, by calling this
                    // method recursively
                    clone(itemPath, source_directory, target_directory, manifest_file_name);
                } else if(stats.isFile() && item[0] !== "."){
                    fs.readFile(itemPath, (error, buffer) => {
                        if (error) throw error;
                        // In order for my tree traversal to work I need to know the absolute paths from the root
                        // With this I cutoff the parts that are above the source directory file and
                        // join it with the directory that contains the item.
                        const source_directory_relative = path.posix.basename(source_directory);
                        const relative_path_from_source_to_item_directory = path.posix.relative(source_directory, dir);
                        const final_path = path.posix.join(source_directory_relative, relative_path_from_source_to_item_directory) + "/";
                        // I am doing this because in siska's example he doesn't count \n or \r in the computation of the check sum
                        const string_without_line_breaks = buffer.toString().replace(/(\r\n|\n|\r)/gm,"");
                        // generate the artificial id and append the original extension
                        const artificial_id_of_file = artificial_id_generator(check_sum_of_string(string_without_line_breaks), string_without_line_breaks.length, check_sum_of_string(final_path));
                        const file_extension = path.posix.extname(itemPath);
                        const target_path = path.posix.join(target_directory, artificial_id_of_file + file_extension);
                        const data_to_save = artificial_id_of_file + file_extension + " " + relative_path_from_source_to_item_directory + "/" + item + '\n';
                        fs.appendFile(path.posix.join(source_directory, manifest_file_name), data_to_save, function (err){
                            if(err) console.log(err);
                        });
                        fs.appendFile(path.posix.join(target_directory, manifest_file_name), data_to_save, function (err){
                            if(err) console.log(err);
                        });
                        fs.copyFile(itemPath, target_path, function (err){
                            if(err) console.log(err);
                        });
                    });
                }
            });
        });
    });
};

/**
 * Given two directories, clones the content of the source directory into the target directory with the content file name converted into artificial id's
 * @param source_directory
 * @param target_directory
 * @param command string that represents the user input
 */
let clone_directory = function (source_directory, target_directory, command){
    mkdirRecursive(target_directory);
    let manifest_file_name = ".man-1.txt";
    fs.writeFile(path.posix.join(source_directory, manifest_file_name), getTimeStamp() + '\n'+ command + '\n', function (err){
        if(err) console.log(err);
    });
    fs.writeFile(path.posix.join(target_directory, manifest_file_name), getTimeStamp() + '\n'+ command +'\n', function (err){
        if(err) console.log(err);
    });
    clone(source_directory, source_directory, target_directory, manifest_file_name);
}

/**
 * find the most current manifest file
 * @param source_directory the directory to search for the most current manifest file
 * @returns {number} the most current version of the manifest as a number
 */
let find_largest_manifest_file_value = function (source_directory){
    let options = {'cwd' : path.resolve(source_directory) , 'dot' : true, 'root' : path.resolve(source_directory)};
    let files = glob.sync(".man-+([0-9]).txt", options).toString().split(",");
    let largest_integer = 1;
    for(let i = 0;i < files.length;i++){
        let the_num = files[i].match("([0-9])+")[0];
        let the_num_to_int = parseInt(the_num);
        if(the_num_to_int > largest_integer)
            largest_integer = the_num_to_int;
    }
    return largest_integer;
}

/**
 * store the latest version of user project in specified target directory
 * @param source_directory the source directory the user would like to 'check-in'
 * @param target_directory the target directory that will contain the latest build of user project
 * @param command the command the userinputted
 */
let check_in = function(source_directory, target_directory, command){
    let most_current_manifest_value = find_largest_manifest_file_value(source_directory);
    mkdirRecursive(target_directory);
    // increment by one to note that we now have one version larger
    most_current_manifest_value++;
    let manifest_file_name = ".man-" + most_current_manifest_value + ".txt";
    fs.writeFile(path.posix.join(source_directory, manifest_file_name), getTimeStamp() + '\n'+ command + '\n', function (err){
        if(err) console.log(err);
    });
    fs.writeFile(path.posix.join(target_directory, manifest_file_name), getTimeStamp() + '\n'+ command +'\n', function (err){
        if(err) console.log(err);
    });
    clone(source_directory, source_directory, target_directory, manifest_file_name);
}

/**
 * Given a string do a particular function execution
 * @param command the string that was inputted by a user
 */
function executeCmd(command){
    let component = command.split(' ');
    switch(component[0]){
        case "createRepo" :
            clone_directory(component[1], component[2], command)
            return (Promise.resolve("Repo Created"))
            break;
        case "checkin":
            checkin(component[1], component[2], command)
            return (Promise.resolve("Successfully Checked-In " + component[1] + " to " + component[2]))
            break;
        case "checkout":
            checkout(component[1],component[2], command)
            return (Promise.resolve("Successfully Checked " + component[1] + " out to " + component[2]))
            break;
        case "label" :
            label_command(component[1],component[2],component[3])
            return (Promise.resolve("Successfuly added the label " + component[3] + "to the file " + component[2]))
            break;
        case "list":
            return (Promise.resolve(list(component[1])))
            break;
    }

}


//Driver Code
app.use(bodyParser.urlencoded({extended: true}));

//Handles commands entered into webpage
app.post('/get_user_request', (req, res, next) => {
    executeCmd(req.body.Request_box)
        .then(
            (message) => {
                //close the client response
                res
                    .type("text/plain")
                    .send(message)
                ;
            }
        )
        .catch(next)
    ;
    
});

//Handles serving the landing page 
app.get('/', function(req,res){
    res.sendFile(__dirname + '/index.html');
});

//express listening on port 3000
app.listen(3000);

module.exports = app;
