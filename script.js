async function getPatternWords(pattern) {
  // Fetch the Wordle word list
  const response = await fetch('https://raw.githubusercontent.com/tabatkins/wordle-list/main/words');
  const wordListText = await response.text();
  const wordList = wordListText.trim().split('\n').map(w => w.toUpperCase());

  const word = document.getElementById("dailyword").value

  const targetWord = word.toUpperCase();
  const validWords = [];

  // For each word in the list, check if it matches the pattern
  for (const candidate of wordList) {
    if (matchesPattern(candidate, targetWord, pattern) && candidate != word) {
      validWords.push(candidate);
      if (validWords.length >= 1) {
        break;
      }
    }
  }

  return validWords;
}

let strictMode = true

function matchesPattern(candidate, targetWord, pattern) {
  if (candidate.length !== 5 || targetWord.length !== 5 || pattern.length !== 5) {
    return false;
  }

  // Get what Wordle would actually show for this candidate
  const actualPattern = checkWordAgainstTarget(candidate, targetWord);

  if (strictMode) {
    // Strict mode: exact pattern match (G must be G, Y must be Y, E must be E)
    const actualPatternString = actualPattern.join('');
    return actualPatternString === pattern;
  } else {
    // Loose mode: treat G and Y as just "filled"
    for (let i = 0; i < 5; i++) {
      if (pattern[i] === 'E') {
        // Pattern expects empty, actual must be empty
        if (actualPattern[i] !== 'E') {
          return false;
        }
      } else {
        // Pattern expects filled (G or Y), actual must be filled (G or Y)
        if (actualPattern[i] === 'E') {
          return false;
        }
      }
    }
    return true;
  }
}

// Manual word checking function that returns the pattern array with E/G/Y
function checkWordAgainstTarget(guess, target) {
  const pattern = ['E', 'E', 'E', 'E', 'E']; // Start with all empty
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

// DONT TOUCH ANYTHING UNDER HERE!!

function replaceCharAt(str, index, replacement) {
  if (index < 0 || index >= str.length) return str; // index out of bounds
  return str.slice(0, index) + replacement + str.slice(index + 1);
}

let currentPattern = ["EEEEE", "EEEEE", "EEEEE", "EEEEE", "EEEEE", "EEEEE"]
console.log(currentPattern[0] + "\n" + currentPattern[1] + "\n" + currentPattern[2] + "\n" + currentPattern[3] + "\n" + currentPattern[4])

function changeSpot(btn, row, col) {

  if (currentPattern[row][col] == "E") {
    currentPattern[row] = replaceCharAt(currentPattern[row], col, "Y")
    btn.style.backgroundColor = "var(--yellow)"
  } else if (currentPattern[row][col] == "Y") {
    currentPattern[row] = replaceCharAt(currentPattern[row], col, "G")
    btn.style.backgroundColor = "var(--green)"
  } else if (currentPattern[row][col] == "G") {
    currentPattern[row] = replaceCharAt(currentPattern[row], col, "E")
    btn.style.backgroundColor = "var(--empty)"
  }


  console.log(currentPattern[0] + "\n" + currentPattern[1] + "\n" + currentPattern[2] + "\n" + currentPattern[3] + "\n" + currentPattern[4] + "\n" + currentPattern[5])
}

function generateWords() {
  console.log(currentPattern[0])
  let i = 0
  document.querySelectorAll(".btnrow").forEach(div => {
      getPatternWords(currentPattern[i]).then(output => {
        const buttons = div.querySelectorAll(".letterbtn");
        const chars = output[0]; // assuming output = ["hello"], so output[0] = "hello"
        for (let v = 0; v < 5 && v < buttons.length; v++) {
          if (output[0] == undefined) {
            buttons[v].textContent = ""
          } else {
            buttons[v].textContent = chars[v];
          }
          
        }
        console.log(chars);
      });
      i += 1
  })
  
}

function toggleStrict(btn) {
  strictMode = !strictMode
  if (strictMode) {
    btn.textContent = "STRICT"
  } else {
    btn.textContent = "LOOSE"
  }
}
