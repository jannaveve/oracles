let lines, markov, txt1, txt2;
let furbishSounds = [];
let isReady = false; 
let x = 30, y = 60; 
let amador;
let pic;

// A variable to track the last hour  preventing it from
// regenerating for the entire minute.
let lastGeneratedHour = -1;
let initialMessage = "Click to generate or wait for a matching hour and minute (e.g., 10:10, 11:11)...";

function preload() {
    txt1 = loadStrings('news.txt');
    txt2 = loadStrings('oracle.txt');
    pic = loadImage("illuminatedmanuscriptipad.png");
    // Load your Furbish sound files here.
    let numSounds = 100; // Change this number to match how many sound files 
    for (let i = 1; i <= numSounds; i++) {
        let soundPath = `furbish/furbSound${i}.wav`;
        furbishSounds.push(loadSound(soundPath));
    }
  amador= loadFont('AmadorGothicC.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(amador);
  textSize(36);
    textLeading(40);
    textAlign(CENTER);
  //imageMode(CENTER);

    lines = [initialMessage];
    
    // create a markov model w' n=4
    markov = RiTa.markov(4);

    // load text into the model
    markov.addText(txt1.join(' '));
    markov.addText(txt2.join(' '));
    
    isReady = true;
}

// A function to play a random sound from the furbishSounds array
function playRandomFurbishSound() {
    if (furbishSounds.length > 0) {
        let soundToPlay = random(furbishSounds);
        soundToPlay.play();
    }
}

// The draw() function runs continuously to display the text and check the time.
function draw() {
    background("#ece2e1");
    image(pic,0,0,windowWidth,windowHeight);
    fill("#4b6bb3");

    if (!isReady) {
        textSize(24);
        textAlign(CENTER);
        text("Loading...", width / 2, height / 2);
        return;
    }
    
    // --- Countdown Clock Logic ---
    let now = new Date();
    let currentHour = now.getHours();
    let currentMinute = now.getMinutes();
    let currentSecond = now.getSeconds();

    // Find the next matching time
    let nextTarget = new Date(now);
    nextTarget.setSeconds(0); // Start from the beginning of the current minute
    nextTarget.setMilliseconds(0);

    while (true) {
        nextTarget.setMinutes(nextTarget.getMinutes() + 1);
        let h12 = nextTarget.getHours() % 12;
        if (h12 === 0) {
            h12 = 12;
        }
        if (h12 === nextTarget.getMinutes()) {
            break;
        }
    }

    let timeRemaining = nextTarget.getTime() - now.getTime();
    let hours = floor(timeRemaining / (1000 * 60 * 60));
    let minutes = floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = floor((timeRemaining % (1000 * 60)) / 1000);
    
    // Format the countdown string
    let countdown = `Next generation in: ${nf(hours, 2)}h ${nf(minutes, 2)}m ${nf(seconds, 2)}s`;
    
    // Display the countdown at the top
    textSize(32);
    textAlign(CENTER);
    text(countdown, width / 2, 5%);
    
    // Reset text alignment and size for the main text
    textSize(36);
    textAlign(CENTER);

    // --- End of Countdown Clock Logic ---

    // Display the main text
    text(lines.join(' '), x+ 30%, height/2, width - x * 2 - 20%, height - y * 2 );

    // Get the current hour and minute for generation logic
    let h24 = hour(); // 24-hour format (0-23)
    let m = minute();

    // Convert the 24-hour time to a 12-hour format
    let h12 = h24 % 12;
    if (h12 === 0) {
        h12 = 12; // 00:xx and 12:xx should both be 12 on a 12-hour clock
    }

    if (h12 === m && h24 !== lastGeneratedHour) {
        lines = markov.generate(2); 
        playRandomFurbishSound(); 
        lastGeneratedHour = h24; 
    }
}

// The mousePressed() function will generate new text when the mouse is clicked.
function mousePressed() {
    // Only attempt to generate text if the sketch is ready.
    if (isReady) {
        lines = markov.generate(2); 
        playRandomFurbishSound(); 
    }
}
