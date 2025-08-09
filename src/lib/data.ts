export type Challenge = {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: 'C' | 'C++' | 'Java' | 'Python' | 'JavaScript';
  description: string;
  tags: string[];
};

export const challenges: Challenge[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    language: 'Python',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    tags: ['Array', 'Hash Table'],
  },
  {
    id: '2',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    language: 'Java',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    tags: ['Linked List', 'Recursion'],
  },
  {
    id: '3',
    title: 'FizzBuzz',
    difficulty: 'Easy',
    language: 'C++',
    description: 'Write a program that outputs the string representation of numbers from 1 to n. But for multiples of three it should output “Fizz” instead of the number and for the multiples of five output “Buzz”. For numbers which are multiples of both three and five output “FizzBuzz”.',
    tags: ['Math', 'String'],
  },
  {
    id: '4',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    language: 'JavaScript',
    description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    tags: ['Array', 'Two Pointers'],
  },
  {
    id: '5',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    language: 'Python',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    tags: ['Hash Table', 'String', 'Sliding Window'],
  },
  {
    id: '6',
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    language: 'Java',
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
    tags: ['Tree', 'DFS', 'BST'],
  },
  {
    id: '7',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    language: 'C',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
  },
  {
    id: '8',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    language: 'Python',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    tags: ['Array', 'Two Pointers', 'Stack'],
  },
  {
    id: '9',
    title: 'Regular Expression Matching',
    difficulty: 'Hard',
    language: 'C++',
    description: 'Given an input string (s) and a pattern (p), implement regular expression matching with support for \'.\' and \'*\' where \'.\' matches any single character and \'*\' matches zero or more of the preceding element.',
    tags: ['String', 'Dynamic Programming', 'Recursion'],
  },
  {
    id: '10',
    title: 'Merge k Sorted Lists',
    difficulty: 'Hard',
    language: 'Java',
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    tags: ['Linked List', 'Divide and Conquer', 'Heap'],
  },
];

export type LeaderboardUser = {
  rank: number;
  name: string;
  points: number;
};

export const leaderboardData: LeaderboardUser[] = [
  { rank: 1, name: 'CodeMaster_01', points: 9850 },
  { rank: 2, name: 'AlgoQueen', points: 9500 },
  { rank: 3, name: 'JavaJuggernaut', points: 9210 },
  { rank: 4, name: 'Pythonista_Pro', points: 8900 },
  { rank: 5, name: 'RecursiveRider', points: 8750 },
  { rank: 6, name: 'SyntaxSorcerer', points: 8500 },
  { rank: 7, name: 'DebugDynamo', points: 8230 },
  { rank: 8, name: 'BitBard', points: 8100 },
  { rank: 9, name: 'LogicLeaper', points: 7990 },
  { rank: 10, name: 'ScriptSavvy', points: 7800 },
];
