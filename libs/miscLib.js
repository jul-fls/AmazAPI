var fs = require('fs');

function save_html(body) {
    fs.writeFile('test.html', body, function(error) {
        if (error) {
            return console.log(error);
        }
        console.log('The file was saved!');
    });
}

module.exports = {
    save_html: save_html
};