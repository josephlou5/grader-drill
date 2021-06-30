import React from 'react';
import QuestionPage from './components/questionPage';
import './App.css';

function App() {
  const state = {
    hasQuestionField: true,
    hasCodeField: true,
    hasAnswerField: true,
    questionText: "What's wrong with this code?",
    code: "public class Question {\n    public static void main(String[] args) {\n        System.out.println(\"Hello world\");\n    }\n}",
    highlights: [
        // { 'startLine': 0, 'startChar': 14, 'endLine': 1, 'endChar': 5, 'byUser': false },
        // { 'startLine': 1, 'startChar': 8, 'endLine': 1, 'endChar': 11, 'byUser': false },
    ],
    // if empty, free response answers
    answerChoices: [
      // 'choice 1',
      // 'choice 2',
      // 'etc',
    ],
  };

  return (
    <div className="App">
      <QuestionPage question={state} />
    </div>
  );
}

export default App;
