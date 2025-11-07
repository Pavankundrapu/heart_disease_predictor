import React, { useState } from 'react';
import { Heart, CheckCircle, AlertTriangle } from 'lucide-react';

const QUESTIONS = [
  {
    question: 'Which lifestyle change most reduces heart disease risk?',
    options: ["Daily brisk walking/exercise", "Eating red meat", "Sleeping less than 5 hours", "Quitting fruits"],
    answer: 0,
    explanation: "Regular exercise (like daily brisk walking) is proven to reduce the risk of cardiovascular disease."
  },
  {
    question: 'What is a safe normal blood pressure for most adults?',
    options: ["180/120 mmHg", "140/90 mmHg", "120/80 mmHg", "100/40 mmHg"],
    answer: 2,
    explanation: "For most adults, 120/80 mmHg is considered ideal. Consistently above 140/90 is hypertension."
  },
  {
    question: 'Which factor is NOT a major risk for heart disease?',
    options: ["Smoking", "High cholesterol", "Diabetes", "Frequent hand washing"],
    answer: 3,
    explanation: "While the first three are major risks, washing hands does not affect heart disease risk."
  },
  {
    question: 'Eating more fruits/veggies helps prevent heart disease?',
    options: ["True", "False"],
    answer: 0,
    explanation: "Diet rich in fruits and vegetables is recommended to reduce your risk."
  }
];

function Quiz() {
  const [step, setStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const finished = step >= QUESTIONS.length;

  const handleSelect = idx => {
    setUserAnswers([...userAnswers, idx]);
    setStep(step + 1);
  };

  const score = userAnswers.filter((a, i) => a === QUESTIONS[i].answer).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mx-auto mb-8 max-w-xl animate-fadeIn">
      <div className="flex items-center mb-4 gap-2">
        <Heart className="w-6 h-6 text-red-500" />
        <h3 className="text-lg font-semibold">Heart Health Mini Quiz</h3>
      </div>
      {!finished ? (
        <div>
          <p className="font-medium mb-4">{step + 1}. {QUESTIONS[step].question}</p>
          <ul className="space-y-2 mb-6">
            {QUESTIONS[step].options.map((op, idx) => (
              <li key={idx}>
                <button
                  onClick={() => handleSelect(idx)}
                  className="w-full text-left bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                >
                  {op}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p className="text-xl font-bold mb-2 text-blue-700">Quiz Complete!</p>
          <p className="mb-4">Your score: <span className="font-bold text-green-600">{score} / {QUESTIONS.length}</span></p>
          <ul className="space-y-3">
            {QUESTIONS.map((q, i) => (
              <li key={i} className="bg-gray-50 rounded p-3">
                <span className="font-medium">{q.question}</span><br />
                <span className="flex items-center mt-1">
                  {userAnswers[i] === q.answer ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={userAnswers[i] === q.answer ? "text-green-700" : "text-red-700"}>
                    {q.options[q.answer]}
                  </span>
                </span>
                <span className="block text-xs text-blue-500 mt-1">{q.explanation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Quiz;



