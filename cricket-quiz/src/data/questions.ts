export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const cricketQuestions: Question[] = [
  {
    id: 1,
    text: "Who has the highest individual score in an ODI innings?",
    options: ["Sachin Tendulkar", "Rohit Sharma", "Virender Sehwag", "Chris Gayle"],
    correctAnswer: "Rohit Sharma",
    explanation: "Rohit Sharma scored exactly 264 runs against Sri Lanka in 2014, the highest in ODI history."
  },
  {
    id: 2,
    text: "Which team has won the most IPL titles?",
    options: ["Mumbai Indians", "Chennai Super Kings", "Both CSK & MI", "Kolkata Knight Riders"],
    correctAnswer: "Both CSK & MI",
    explanation: "CSK and MI both have won 5 IPL trophies each."
  },
  {
    id: 3,
    text: "Who is the first batsman to cross 10,000 runs in Tests?",
    options: ["Sunil Gavaskar", "Sir Don Bradman", "Brian Lara", "Sachin Tendulkar"],
    correctAnswer: "Sunil Gavaskar",
    explanation: "Sunil Gavaskar was the first to cross the 10,000-run mark in Test cricket in 1987."
  },
  {
    id: 4,
    text: "Who bowled the fastest delivery ever recorded in international cricket?",
    options: ["Brett Lee", "Shoaib Akhtar", "Shaun Tait", "Mitchell Starc"],
    correctAnswer: "Shoaib Akhtar",
    explanation: "Shoaib Akhtar bowled at 161.3 km/h (100.2 mph) against England in the 2003 World Cup."
  },
  {
    id: 5,
    text: "Which player has taken the most wickets in international cricket?",
    options: ["Shane Warne", "Anil Kumble", "James Anderson", "Muttiah Muralitharan"],
    correctAnswer: "Muttiah Muralitharan",
    explanation: "Muttiah Muralitharan took 800 Test wickets and 534 ODI wickets, highest across formats."
  },
  {
    id: 6,
    text: "Where was the first ever Cricket World Cup held in 1975?",
    options: ["Australia", "India", "England", "West Indies"],
    correctAnswer: "England",
    explanation: "England hosted the first Cricket World Cup in 1975, won by the West Indies."
  },
  {
    id: 7,
    text: "Who is known as the 'Hitman' in Indian cricket?",
    options: ["Virat Kohli", "MS Dhoni", "Rohit Sharma", "Suryakumar Yadav"],
    correctAnswer: "Rohit Sharma",
    explanation: "Rohit Sharma is universally known as 'Hitman' due to his ability to hit massive sixes."
  },
  {
    id: 8,
    text: "Which bowler has taken a hat-trick in the first over of a Test match?",
    options: ["Irfan Pathan", "Wasim Akram", "Lasith Malinga", "Stuart Broad"],
    correctAnswer: "Irfan Pathan",
    explanation: "Irfan Pathan took a hat-trick in the first over against Pakistan in 2006 at Karachi."
  },
  {
    id: 9,
    text: "What is the length of an official cricket pitch?",
    options: ["20 Yards", "22 Yards", "24 Yards", "18 Yards"],
    correctAnswer: "22 Yards",
    explanation: "The official length of a cricket pitch from one wicket to the other is exactly 22 yards."
  },
  {
    id: 10,
    text: "Which country won the inaugural ICC T20 World Cup in 2007?",
    options: ["Australia", "Pakistan", "India", "South Africa"],
    correctAnswer: "India",
    explanation: "India beat Pakistan in the final to win the first T20 World Cup in 2007."
  }
];

export const getRandomQuestions = (count: number = 5): Question[] => {
  const shuffled = [...cricketQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
