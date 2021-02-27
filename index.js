const express = require('express')
const app = express()
const csv = require('csv-parser')
var readline = require('readline-sync');
const fs = require('fs')
const dict = require("./cleanDictionary.json");



app.get('/getword', (req, res) => {
    const word = getRandomWord();
    res.send({
        "word": word.word,
        "definition": word.def1 + (word.def2 === undefined ? "" : ", " + word.def2),
    })
})

app.use(express.static('web'));

app.listen(3000, () => {
    console.log("Running")
})



function runHangman() {
    const word = getRandomWord();
    const guesses = [];
    let guessed = false;
    let incorrect = 0;
    let previousBlanks = "_";
    while (!guessed) {
        console.clear();
        console.log(getBlanks(word.word, guesses));
        console.log(word.def1 + ", " + word.def2);
        console.log((10 - incorrect) + " tries left");
        console.log(guesses)
        var answer = readline.question("Your guess: ");
        guesses.push(answer.toUpperCase());
        const blanks = getBlanks(word.word, guesses);
        if (!blanks.includes("_")) {
            guessed = true;
        }
        if (previousBlanks == blanks && countInArray(guesses, answer) < 2) {
            if (++incorrect > 9) {
                break;
            }
        }
        previousBlanks = blanks;
    }
    if (guessed) {
        console.clear();
        console.log(getBlanks(word.word, guesses));
        console.log(word.def1 + ", " + word.def2);
        console.log("You got it!");
        return true;
    } else {
        console.log("Das Wort war " + word.word);
        return false;
    }
}

function countInArray(array, what) {
    return array.filter(item => item == what).length;
}

function buildLibrary() {
    const dictionary = [];
    console.log("Starting...");
    fs.createReadStream('openthesaurus.txt')
        .pipe(csv({ separator: ";" }))
        .on('data', (data) => dictionary.push(data))
        .on('end', () => {
            console.log("done, writing...")
            fs.writeFileSync('dictionary.json', JSON.stringify(dictionary, null, 2));
            console.log("Saved, done!");
        });
}

function cleanLibrary() {
    const cleanDict = [];
    for (item of dict) {
        if (!item.word.includes(" ") && !item.word.includes("-") && !item.word.includes("(") && !item.word.includes(".")) {
            cleanDict.push(item);
        } else {
            console.log(item.word + " was not okay");
            let cleanWord = item;
            for (key in item) {
                if (!item[key].includes(" ") && !item[key].includes("-") && !item[key].includes("(") && !item[key].includes(".")) {
                    console.log("use " + item[key] + " instead");
                    cleanWord.word = item[key];
                    cleanWord[key] = item.word;
                    //console.log(item.word + " is now " + cleanWord.word);
                    break;
                } else {
                    console.log(item[key] + " wasn't either");
                }
            }
            if (item !== cleanWord) {
                cleanDict.push(cleanWord);
            }
        }
    }
    fs.writeFileSync('cleanDictionary.json', JSON.stringify(cleanDict, null, 2));
    console.log("Saved, done!");
}

function getRandomWord() {
    const item = dict[Math.floor(Math.random() * dict.length)];
    if (item.word.includes(" ") || item.word.includes("-")) {
        return getRandomWord();
    } else {
        return item
    }
}

function getBlanks(word, letters) {
    return word.toUpperCase().split("").map((letter) => {
        if (letters.includes(letter)) {
            return letter;
        }
        return "_"
    }).join(" ");
}