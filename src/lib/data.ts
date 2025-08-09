export type Challenge = {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: 'C' | 'C++' | 'Java' | 'Python' | 'JavaScript';
  description: string;
  tags: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
};

export const challenges: Challenge[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    language: 'Python',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    tags: ['Array', 'Hash Table'],
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]'
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]'
      }
    ]
  },
  {
    id: '2',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    language: 'Java',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    tags: ['Linked List', 'Recursion'],
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]'
      },
      {
        input: 'head = [1,2]',
        output: '[2,1]'
      },
      {
        input: 'head = []',
        output: '[]'
      }
    ]
  },
  {
    id: '3',
    title: 'FizzBuzz',
    difficulty: 'Easy',
    language: 'C++',
    description: 'Write a program that outputs the string representation of numbers from 1 to n. But for multiples of three it should output “Fizz” instead of the number and for the multiples of five output “Buzz”. For numbers which are multiples of both three and five output “FizzBuzz”.',
    tags: ['Math', 'String'],
    examples: [
      {
        input: 'n = 3',
        output: '["1","2","Fizz"]'
      },
      {
        input: 'n = 5',
        output: '["1","2","Fizz","4","Buzz"]'
      },
      {
        input: 'n = 15',
        output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]'
      }
    ]
  },
  {
    id: '4',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    language: 'JavaScript',
    description: 'You are given an integer array height of length n. There are n vertical lines drawn such as the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    tags: ['Array', 'Two Pointers'],
    examples: [
      {
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49.'
      },
      {
        input: 'height = [1,1]',
        output: '1'
      }
    ]
  },
  {
    id: '5',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    language: 'Python',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.'
      }
    ]
  },
  {
    id: '6',
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    language: 'Java',
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
    tags: ['Tree', 'DFS', 'BST'],
    examples: [
      {
        input: 'root = [2,1,3]',
        output: 'true'
      },
      {
        input: 'root = [5,1,4,null,null,3,6]',
        output: 'false',
        explanation: 'The root node\'s value is 5 but its right child\'s value is 4.'
      }
    ]
  },
  {
    id: '7',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    language: 'C',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    examples: [
      {
        input: 'nums1 = [1,3], nums2 = [2]',
        output: '2.00000',
        explanation: 'merged array = [1,2,3] and median is 2.'
      },
      {
        input: 'nums1 = [1,2], nums2 = [3,4]',
        output: '2.50000',
        explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.'
      }
    ]
  },
  {
    id: '8',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    language: 'Python',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    tags: ['Array', 'Two Pointers', 'Stack'],
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.'
      },
      {
        input: 'height = [4,2,0,3,2,5]',
        output: '9'
      }
    ]
  },
  {
    id: '9',
    title: 'Regular Expression Matching',
    difficulty: 'Hard',
    language: 'C++',
    description: 'Given an input string (s) and a pattern (p), implement regular expression matching with support for \'.\' and \'*\' where \'.\' matches any single character and \'*\' matches zero or more of the preceding element.',
    tags: ['String', 'Dynamic Programming', 'Recursion'],
    examples: [
      {
        input: 's = "aa", p = "a"',
        output: 'false',
        explanation: '"a" does not match the entire string "aa".'
      },
      {
        input: 's = "aa", p = "a*"',
        output: 'true',
        explanation: '\'*\' means zero or more of the preceding element, \'a\'. Therefore, by repeating \'a\' once, it becomes "aa".'
      },
      {
        input: 's = "ab", p = ".*"',
        output: 'true',
        explanation: '".*" means "zero or more of any character".'
      }
    ]
  },
  {
    id: '10',
    title: 'Merge k Sorted Lists',
    difficulty: 'Hard',
    language: 'Java',
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    tags: ['Linked List', 'Divide and Conquer', 'Heap'],
    examples: [
      {
        input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
        output: '[1,1,2,3,4,4,5,6]'
      },
      {
        input: 'lists = []',
        output: '[]'
      },
      {
        input: 'lists = [[]]',
        output: '[]'
      }
    ]
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
