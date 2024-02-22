function preprocessStockPrice(data) {
    const lines = data.split('\n');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const fields = line.split(',"');
        let volume = parseFloat(fields[5].substring(0, fields[5].length - 2).replace(/,/g, ''));
        result.push({
            date: new Date(fields[0].substring(1, fields[0].length - 1).replace(/ /g, '')),
            endPrice: parseInt(fields[1].substring(0, fields[1].length - 1).replace(/,/g, '')),
            startPrice: parseInt(fields[2].substring(0, fields[2].length - 1).replace(/,/g, '')),
            highPrice: parseInt(fields[3].substring(0, fields[3].length - 1).replace(/,/g, '')),
            lowPrice: parseInt(fields[4].substring(0, fields[4].length - 1).replace(/,/g, '')),
            volume: !isNaN(volume) ?  volume : null,
            volatility: parseFloat(fields[6].substring(0, fields[6].length - 2).replace(/,/g, '')),
        });
    }
    return result;
}

function getCategoryCode(str) {
    const match = str.match(/[0-9]/);
    if (match) {
        const index = match.index;
        return {
            name: str.substring(0, index),
            code: str.substring(index, str.length),
            market: "kospi"
        };
    } else {
        return null;
    }
}

function preprocessStockItem(data) {
    const lines = data.split('\n');
    const result = [];

    for (let line of lines) {
        const fields = line.split(',');
        const categoryCode = getCategoryCode(fields[0]);
        if (categoryCode) {
            result.push(categoryCode);
        }
    }
    return result;
}

// const fileReader = new FileReader("/Users/jinhyeon/KJH/dev/wy-portfolio/data/kospi200/000080test.csv");
// const data = fileReader.read();

module.exports = {preprocessStockItem, preprocessStockPrice};