let questions = [];
let currentIndex = 0;
let score = 0;
let attempted = 0;
let correct = 0;
let wrong = 0;
let timer = 1800; // 30 minutes
let userAnswers = {};
let username = "";
let timerInterval;

// Fetch questions from API
(async function fetchQuestions() {
    try {
        let response = await fetch("https://opentdb.com/api.php?amount=30&type=multiple");
        let data = await response.json();

        questions = data.results.map(q => {
            let options = [...q.incorrect_answers, q.correct_answer];
            options.sort(() => Math.random() - 0.5); // Shuffle options

            return {
                question: q.question,
                options: options,
                answer: q.correct_answer
            };
        });

        document.getElementById("remaining").innerText = questions.length;
        loadQuestion();
    } catch (error) {
        console.log("Error fetching questions:", error);
    }
})();

// Start quiz
function startQuiz() {
    username = document.getElementById("username").value.trim();
    
    if (!username) {
        alert("Please enter your name!");
        return;
    }

    document.getElementById("login-container").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";

    fetchQuestions();
    startTimer();
}

// Timer function
(function startTimer() {
    clearInterval(timerInterval); 
    timer = 1800;

    timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--;
            let minutes = Math.floor(timer / 60);
            let seconds = timer % 60;
            document.getElementById("time").innerText = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        } else {
            endGame();
        }
    }, 1000);
})();

// Load question
function loadQuestion() {
    let q = questions[currentIndex];
    
    document.getElementById("question").innerHTML = q.question;
    let optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = ""; 

    q.options.forEach(option => {
        let button = document.createElement("button");
        button.innerText = option;
        button.onclick = function () {
            checkAnswer(button, option, q.answer);
        };

        // Disable already selected options when going back
        if (userAnswers[currentIndex]) {
            button.disabled = true;
            if (option === userAnswers[currentIndex].selected) {
                button.style.backgroundColor = userAnswers[currentIndex].correct ? "green" : "red";
            }
        }

        optionsDiv.appendChild(button);
    });

    document.getElementById("prev").disabled = currentIndex === 0;
}

// Check answer
function checkAnswer(button, selected, correctAnswer) {
    if (userAnswers[currentIndex]) return; // Prevent re-answering

    attempted++;
    let isCorrect = selected === correctAnswer;

    if (isCorrect) {
        button.style.backgroundColor = "green";
        score += 10;
        correct++;
    } else {
        button.style.backgroundColor = "red";
        wrong++;
	let trButtons = document.querySelectorAll("#options button");
    	trButtons.forEach(btn => {
	if(btn.innerHTML === correctAnswer){
		btn.style.backgroundColor = "green";
	}
      })
    }

    userAnswers[currentIndex] = { selected, correct: isCorrect };

    document.getElementById("score").innerText = score;
    document.getElementById("attempted").innerText = attempted;
    document.getElementById("correct").innerText = correct;
    document.getElementById("wrong").innerText = wrong;

    // Disable all options after selection
    let allButtons = document.querySelectorAll("#options button");
    allButtons.forEach(btn => btn.disabled = true);

    if (attempted === 30) {
        endGame();
    }
}

// Navigate questions
function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        loadQuestion();
    }
}

function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        loadQuestion();
    }
}

// Submit quiz
function submitQuiz() {
    let confirmSubmit = confirm("Are you sure you want to submit?");
    if (confirmSubmit) {
        endGame();
    }
}

// End game
function endGame() {
    clearInterval(timerInterval);

		$("#quiz-container").hide();

		let ResultHTML = `
       		<h2>Quiz Completed!</h2>
       		<p><strong>Name:</strong> ${username}</p>
       		<p><strong>Final Score:</strong> ${score}</p>
       		<p><strong>Attempted Questions:</strong> ${attempted}</p>
       		<p><strong>Correct Answers:</strong> ${correct}</p>
       		<p><strong>Wrong Answers:</strong> ${wrong}</p>
         <button onclick="restartQuiz()">Restart Quiz</button>
  		`;
		$("#result-container").append(ResultHTML);
   $("#result-container").show();
}
  function restartQuiz(){
     location.reload();
  }
