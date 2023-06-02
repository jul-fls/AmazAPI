var fs = require('fs');

async function save_content_to_file(content,filename) {
    await fs.writeFile(filename, content, function(error) {
        if (error) {
            return console.log(error);
        }
        // console.log('The file was saved!');
    });
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var $r = Math.random() * 16 | 0,
            $v = c == 'x' ? $r : ($r & 0x3 | 0x8);
        return $v.toString(16);
    });
}

function get_random_string($length) {
    $result = '';
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    $charactersLength = $characters.length;
    for (let $i = 0; $i < $length; $i++) {
        $result += $characters.charAt(Math.floor(Math.random() * $charactersLength));
    }
    return $result;
}

module.exports = {
    save_content_to_file: save_content_to_file,
    uuidv4: uuidv4,
    get_random_string: get_random_string
};