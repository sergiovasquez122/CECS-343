//requiring path and fs modules
const path = require('path');
const fs = require('fs');
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
 * @param directory the absolute path of the paths to be create if they don't exist.
 */
function mkdirRecursive(directory) {
    let directories = directory.replace(/\/$/, '').split('/');
    let segment = "/";
    for (let i = 1; i < directories.length; i++) {
        segment += path.join(directories[i]) + "/";
        !fs.existsSync(segment) ? fs.mkdirSync(segment) : null ;
    }
}

/**
 * Does a depth-first search traversal computing the check sum of files, the relative path from the source and the byte size of the files
 * and then creating an artificial id for the file and copying it into the target directory
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
            let itemPath = path.join(dir, item);
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
                        const source_directory_relative = path.basename(source_directory);
                        const relative_path_from_source_to_item_directory = path.relative(source_directory, dir);
                        const final_path = path.join(source_directory_relative, relative_path_from_source_to_item_directory) + "/";
                        // I am doing this because in siska's example he doesn't count \n or \r in the computation of the check sum
                        const string_without_line_breaks = buffer.toString().replace(/(\r\n|\n|\r)/gm,"");
                        // generate the artificial id and append the original extension
                        const artificial_id_of_file = artificial_id_generator(check_sum_of_string(string_without_line_breaks), string_without_line_breaks.length, check_sum_of_string(final_path));
                        const file_extension = path.extname(itemPath);
                        const target_path = path.join(target_directory, artificial_id_of_file + file_extension);
                        fs.appendFile(path.join(source_directory, manifest_file_name), final_path + " " + artificial_id_of_file + file_extension + '\n', function (err){
                            if(err) console.log(err);
                        });
                        fs.appendFile(path.join(target_directory, manifest_file_name), final_path + " " + artificial_id_of_file + file_extension + '\n', function (err){
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
 */
let clone_directory = function (source_directory, target_directory){
    mkdirRecursive(target_directory);
    let manifest_file_name = ".man-1.txt";
    fs.writeFile(path.join(source_directory, manifest_file_name), getTimeStamp() + '\n', function (err){
        if(err) console.log(err);
    });
    fs.writeFile(path.join(target_directory, manifest_file_name), getTimeStamp() + '\n', function (err){
       if(err) console.log(err);
    });
    clone(source_directory, source_directory, target_directory, manifest_file_name);
}

//mkdirRecursive("/home/sergio/repo/mypt");
//walk("/home/sergio/bot/", "/home/sergio/bot/");
//mkdirRecursive("/home/sergio/repo/mypt");
clone_directory("/home/sergio/bot/", "/home/sergio/repo/mypt/");