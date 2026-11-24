/**
 * DEBUG DAPUR - Quiz System
 * Interactive 10-Question Comprehensive Assessment Engine
 */

window.DebugDapur = window.DebugDapur || {};

window.DebugDapur.QuizSystem = (function() {
  let questions = [];
  let currentIndex = 0;
  let userAnswers = {};
  let isAnswerSubmitted = false;

  function init() {
    questions = (window.DebugDapur.Data && window.DebugDapur.Data.QUIZ_QUESTIONS) || [];
    currentIndex = 0;
    userAnswers = {};
    isAnswerSubmitted = false;
  }

  function getCurrentQuestion() {
    return questions[currentIndex];
  }

  function getQuestionCount() {
    return questions.length;
  }

  function getCurrentIndex() {
    return currentIndex;
  }

  function submitAnswer(optionIndex) {
    if (isAnswerSubmitted) return null;

    const currentQ = questions[currentIndex];
    const isCorrect = (optionIndex === currentQ.correctAnswer);

    userAnswers[currentIndex] = {
      selectedOption: optionIndex,
      isCorrect: isCorrect
    };

    isAnswerSubmitted = true;

    if (window.DebugDapur.AudioManager) {
      if (isCorrect) {
        window.DebugDapur.AudioManager.playSuccess();
      } else {
        window.DebugDapur.AudioManager.playBugError();
      }
    }

    return {
      isCorrect,
      correctIndex: currentQ.correctAnswer,
      explanation: currentQ.explanation
    };
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      isAnswerSubmitted = false;
      return true;
    }
    return false; // Quiz completed
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      currentIndex--;
      isAnswerSubmitted = (userAnswers[currentIndex] !== undefined);
      return true;
    }
    return false;
  }

  function getResults() {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] && userAnswers[idx].isCorrect) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);

    let predicate = "Perlu Latihan Lagi";
    if (scorePercent >= 90) {
      predicate = "Master Chef Algoritma (Sangat Memuaskan)";
    } else if (scorePercent >= 75) {
      predicate = "Koki Handal (Memuaskan)";
    } else if (scorePercent >= 60) {
      predicate = "Asisten Koki (Cukup)";
    }

    return {
      totalQuestions: questions.length,
      correctCount,
      scorePercent,
      predicate,
      userAnswers
    };
  }

  return {
    init,
    getCurrentQuestion,
    getQuestionCount,
    getCurrentIndex,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    getResults
  };
})();
