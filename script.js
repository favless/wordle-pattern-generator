async function getPatternWords(word, pattern) {
  // Fetch the Wordle word list
  const response = await fetch('https://raw.githubusercontent.com/tabatkins/wordle-list/main/words');
  const wordListText = await response.text();
  const wordList = wordListText.trim().split('\n').map(w => w.toUpperCase());

  const targetWord = word.toUpperCase();
  const validWords = [];

  // For each word in the list, check if it matches the pattern
  for (const candidate of wordList) {
    if (matchesPattern(candidate, targetWord, pattern)) {
      validWords.push(candidate);
      if (validWords.length >= 5) {
        break;
      }
    }
  }

  return validWords;
}

function matchesPattern(candidate, targetWord, pattern) {
  if (candidate.length !== 5 || targetWord.length !== 5 || pattern.length !== 5) {
    return false;
  }

  // Simulate what Wordle would actually show for this candidate
  const actualPattern = getWordlePattern(candidate, targetWord);
  
  // Convert our F/E pattern to G/Y/B (Green/Yellow/Black)
  const expectedPattern = [];
  for (let i = 0; i < 5; i++) {
    if (pattern[i] === 'F') {
      // F means either Green (correct position) or Yellow (wrong position)
      if (candidate[i] === targetWord[i]) {
        expectedPattern[i] = 'G';
      } else {
        expectedPattern[i] = 'Y';
      }
    } else {
      // E means Black (not in word or already used up)
      expectedPattern[i] = 'B';
    }
  }

  // Check if the actual pattern matches what we expect
  for (let i = 0; i < 5; i++) {
    if (pattern[i] === 'F') {
      // For filled squares, we need either Green or Yellow
      if (actualPattern[i] !== 'G' && actualPattern[i] !== 'Y') {
        return false;
      }
    } else {
      // For empty squares, we need Black
      if (actualPattern[i] !== 'B') {
        return false;
      }
    }
  }

  return true;
}

function getWordlePattern(guess, target) {
  const pattern = ['B', 'B', 'B', 'B', 'B']; // Start with all black
  const targetLetters = target.split('');
  const guessLetters = guess.split('');
  
  // First pass: mark exact matches (green)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      pattern[i] = 'G';
      targetLetters[i] = null; // Mark as used
      guessLetters[i] = null; // Mark as processed
    }
  }
  
  // Second pass: mark wrong position matches (yellow)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] !== null) { // Not already processed
      const targetIndex = targetLetters.indexOf(guessLetters[i]);
      if (targetIndex !== -1) {
        pattern[i] = 'Y';
        targetLetters[targetIndex] = null; // Mark as used
      }
    }
  }
  
  return pattern;
}

function replaceCharAt(str, index, replacement) {
  if (index < 0 || index >= str.length) return str; // index out of bounds
  return str.slice(0, index) + replacement + str.slice(index + 1);
}

const wordInput = document.getElementById("word")
const worddiv = document.getElementById("wordlist")
let currentPattern = "EEEEE"

function toggleBox(pos, btn) {
  if (currentPattern[pos] == "E") {
    currentPattern = replaceCharAt(currentPattern, pos, "F")
    btn.style.backgroundColor = "#50c04e"
  } else {
    currentPattern = replaceCharAt(currentPattern, pos, "E")
    btn.style.backgroundColor = "#424242"
  }

  console.log(currentPattern)
}

function returnPattern() {
  const word = wordInput.value

  worddiv.innerHTML = "";

  getPatternWords(word, currentPattern).then(words => {
    for (let i = 0; i < words.length; i++) {
      const newSpan = document.createElement("span")
      worddiv.appendChild(newSpan)
      newSpan.classList.add("foundWord", "rubik")
      newSpan.textContent = words[i]
    }
  });
}