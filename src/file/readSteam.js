import fs from 'fs';
import readline from 'readline';

const fileStream = fs.createReadStream('./example.txt');

const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

for await (const line of rl) {
    console.log(`Line: ${line}`);
}
