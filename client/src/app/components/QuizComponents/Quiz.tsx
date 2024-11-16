"use client";
import { useState } from "react";

const Quiz = () => {

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);


    return (
        <div>
            <h1>Quiz</h1>

        </div>
    )
};

export default Quiz;

