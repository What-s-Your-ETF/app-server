const fs = require('fs');

class FileReader {
    constructor(path) {
        this.filePath = path;
    }

    read() {
        return fs.readFileSync(this.filePath, 'utf8');
    }

    readDir() {
        return fs.readdirSync(this.filePath);
    }
}

module.exports = FileReader;