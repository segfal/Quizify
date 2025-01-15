import { Question } from '../interfaces';

// Sample questions (in production, these should come from a database)
const sampleQuestions: Question[] = [
    {
        id: '1',
        question: 'What is 2 + 2?',
        answers: ['3', '4', '5', '6'],
        correctAnswer: 1,
        timeLimit: 20
    },
    {
        id: '2',
        question: 'What is the capital of France?',
        answers: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctAnswer: 1,
        timeLimit: 20
    },
    {
        id: '3',
        question: 'Which planet is closest to the Sun?',
        answers: ['Venus', 'Mercury', 'Mars', 'Earth'],
        correctAnswer: 1,
        timeLimit: 20
    },
    {
        id: '4',
        question: 'What is the largest mammal?',
        answers: ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
        correctAnswer: 1,
        timeLimit: 20
    },
    {
        id: '5',
        question: 'Who painted the Mona Lisa?',
        answers: ['Van Gogh', 'Leonardo da Vinci', 'Picasso', 'Michelangelo'],
        correctAnswer: 1,
        timeLimit: 20
    }
];

export { sampleQuestions };