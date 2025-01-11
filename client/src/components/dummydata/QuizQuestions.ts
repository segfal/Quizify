import { QuizQuestion } from "@/interfaces/quiz/types";

const dummyQuestions: QuizQuestion[] = [
    {
        id: 1,
        question: "Which method is used to add an element to the end of a list in Python?",
        answers: [".append()", ".add()", ".insert()", ".push()"],
        correctAnswer: 0,
        timeLimit: 20, // Increased time limit for more Kahoot-like feel
        points: 1000
    },
    {
        id: 2,
        question: "How do you remove the last element from a list in Python?",
        answers: [".pop()", ".remove()", ".delete()", ".splice()"],
        correctAnswer: 0,
        timeLimit: 20,
        points: 1000
    },
    {
        id: 3,
        question: "What is the correct way to create an empty list in Python?",
        answers: ["list()", "[]", "new List()", "{}"],
        correctAnswer: 1,
        timeLimit: 20,
        points: 1000
    },
    {
        id: 4,
        question: "Which method is used to sort a list in ascending order?",
        answers: [".sort()", ".order()", ".arrange()", ".organize()"],
        correctAnswer: 0,
        timeLimit: 20,
        points: 1000
    },
    {
        id: 5,
        question: "How do you find the length of a list in Python?",
        answers: ["len(list)", "list.length", "list.size()", "count(list)"],
        correctAnswer: 0,
        timeLimit: 20,
        points: 1000
    },
    {
        id: 6,
        question: "Which method is used to remove a specific item from a list?",
        answers: [".remove()", ".delete()", ".pop()", ".splice()"],
        correctAnswer: 0,
        timeLimit: 20,
        points: 1000
    },
    {
        id: 7,
        question: "How do you reverse a list in Python?",
        answers: ["list.reverse()", "reverse(list)", "list[::-1]", "Both A and C"],
        correctAnswer: 3,
        timeLimit: 20,
        points: 1000
    },
    {
        id: 8,
        question: "Which method is used to find the index of an item in a list?",
        answers: [".index()", ".find()", ".search()", ".locate()"],
        correctAnswer: 0,
        timeLimit: 20,
        points: 1000
    }
];

export { dummyQuestions };