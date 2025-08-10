

export type Challenge = {
  id?: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: 'C' | 'C++' | 'Java' | 'Python' | 'JavaScript';
  points: number;
  description: string;
  tags: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: {
    input: string;
    output: string;
    isHidden?: boolean;
  }[];
  starterCode: string;
  solution: string;
  isEnabled?: boolean;
};

export const challenges: Challenge[] = [
  {
    title: 'Palindrome Number',
    difficulty: 'Easy',
    language: 'JavaScript',
    points: 10,
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
    tags: ['Math'],
    examples: [
      {
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.'
      },
      {
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.'
      },
      {
        input: 'x = 10',
        output: 'false',
        explanation: 'Reads 01 from right to left. Therefore it is not a palindrome.'
      }
    ],
    testCases: [
        { input: '121', output: 'true' },
        { input: '-121', output: 'false' },
        { input: '10', output: 'false' },
        { input: '0', output: 'true', isHidden: true },
    ],
    starterCode: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    // Write your code here
};`,
    solution: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    if (x < 0) return false;
    const s = String(x);
    return s === s.split('').reverse().join('');
};`,
    isEnabled: true,
  },
   {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    language: 'Python',
    points: 10,
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    tags: ['Stack', 'String'],
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    testCases: [
        { input: '"()"', output: 'true' },
        { input: '"()[]{}"', output: 'true' },
        { input: '"(]"', output: 'false' },
        { input: '"{[]}"', output: 'true', isHidden: true },
        { input: '"([)]"', output: 'false', isHidden: true },
    ],
    starterCode: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your code here
        pass
`,
    solution: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {")": "(", "}": "{", "]": "["}
        for char in s:
            if char in mapping:
                top_element = stack.pop() if stack else '#'
                if mapping[char] != top_element:
                    return False
            else:
                stack.append(char)
        return not stack`,
    isEnabled: true,
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    language: 'Java',
    points: 15,
    description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
    tags: ['Array', 'Dynamic Programming'],
    examples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit is 0.'
      }
    ],
    testCases: [
        { input: '[7,1,5,3,6,4]', output: '5' },
        { input: '[7,6,4,3,1]', output: '0' },
        { input: '[2,4,1]', output: '2', isHidden: true },
        { input: '[1]', output: '0', isHidden: true },
    ],
    starterCode: `class Solution {
    public int maxProfit(int[] prices) {
        // Write your code here
    }
}`,
    solution: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int i = 0; i < prices.length; i++) {
            if (prices[i] < minPrice) {
                minPrice = prices[i];
            } else if (prices[i] - minPrice > maxProfit) {
                maxProfit = prices[i] - minPrice;
            }
        }
        return maxProfit;
    }
}`,
    isEnabled: true,
  },
  {
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    language: 'C++',
    points: 25,
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operation.',
    tags: ['Array', 'Prefix Sum'],
    examples: [
      {
        input: 'nums = [1,2,3,4]',
        output: '[24,12,8,6]'
      },
      {
        input: 'nums = [-1,1,0,-3,3]',
        output: '[0,0,9,0,0]'
      }
    ],
    testCases: [
        { input: '[1,2,3,4]', output: '[24,12,8,6]' },
        { input: '[-1,1,0,-3,3]', output: '[0,0,9,0,0]' },
        { input: '[1,0]', output: '[0,1]', isHidden: true },
    ],
    starterCode: `#include <vector>

class Solution {
public:
    std::vector<int> productExceptSelf(std::vector<int>& nums) {
        // Write your code here
    }
};`,
    solution: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> answer(n, 1);
        int prefix = 1;
        for (int i = 0; i < n; i++) {
            answer[i] = prefix;
            prefix *= nums[i];
        }
        int postfix = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= postfix;
            postfix *= nums[i];
        }
        return answer;
    }
};`,
    isEnabled: true,
  },
  {
    title: 'Number of Islands',
    difficulty: 'Medium',
    language: 'Python',
    points: 30,
    description: 'Given an m x n 2D binary grid grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.',
    tags: ['Array', 'DFS', 'BFS', 'Matrix'],
    examples: [
      {
        input: `grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]`,
        output: '1'
      },
      {
        input: `grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]`,
        output: '3'
      }
    ],
    testCases: [
      { input: '[["1","1","1"],["0","1","0"],["1","1","1"]]', output: '1' },
      { input: '[["1","0","1","0","1"]]', output: '3', isHidden: true },
    ],
    starterCode: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        # Write your code here
        pass
`,
    solution: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid:
            return 0
        
        rows, cols = len(grid), len(grid[0])
        islands = 0
        
        def dfs(r, c):
            if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == '0':
                return
            grid[r][c] = '0'
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)
            
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    islands += 1
                    dfs(r, c)
        return islands`,
    isEnabled: true,
  },
  {
    title: 'Word Break',
    difficulty: 'Hard',
    language: 'Java',
    points: 50,
    description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words. Note that the same word in the dictionary may be reused multiple times in the segmentation.',
    tags: ['DP', 'Trie', 'Memoization'],
    examples: [
      {
        input: 's = "leetcode", wordDict = ["leet","code"]',
        output: 'true',
        explanation: 'Return true because "leetcode" can be segmented as "leet code".'
      },
      {
        input: 's = "applepenapple", wordDict = ["apple","pen"]',
        output: 'true'
      },
      {
        input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]',
        output: 'false'
      }
    ],
    testCases: [
        { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true' },
        { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true' },
        { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: 'false' },
        { input: 's = "a", wordDict = ["b"]', output: 'false', isHidden: true },
    ],
    starterCode: `import java.util.List;
import java.util.Set;
import java.util.HashSet;

class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        // Write your code here
    }
}`,
    solution: `import java.util.List;
import java.util.Set;
import java.util.HashSet;

class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> wordSet = new HashSet<>(wordDict);
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true;
        for (int i = 1; i <= s.length(); i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && wordSet.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[s.length()];
    }
}`,
    isEnabled: true,
  },
  {
    title: 'First Missing Positive',
    difficulty: 'Hard',
    language: 'C',
    points: 50,
    description: 'Given an unsorted integer array nums, return the smallest missing positive integer. You must implement an algorithm that runs in O(n) time and uses constant extra space.',
    tags: ['Array', 'Hash Table'],
    examples: [
      {
        input: 'nums = [1,2,0]',
        output: '3'
      },
      {
        input: 'nums = [3,4,-1,1]',
        output: '2'
      },
      {
        input: 'nums = [7,8,9,11,12]',
        output: '1'
      }
    ],
    testCases: [
        { input: '[1,2,0]', output: '3' },
        { input: '[3,4,-1,1]', output: '2' },
        { input: '[7,8,9,11,12]', output: '1' },
        { input: '[1]', output: '2', isHidden: true },
    ],
    starterCode: `#include <stdio.h>

int firstMissingPositive(int* nums, int numsSize) {
    // Write your code here
}`,
    solution: `int firstMissingPositive(int* nums, int numsSize) {
    for (int i = 0; i < numsSize; i++) {
        while (nums[i] > 0 && nums[i] <= numsSize && nums[nums[i] - 1] != nums[i]) {
            int temp = nums[nums[i] - 1];
            nums[nums[i] - 1] = nums[i];
            nums[i] = temp;
        }
    }
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] != i + 1) {
            return i + 1;
        }
    }
    return numsSize + 1;
}`,
    isEnabled: true,
  },
];

export type LeaderboardUser = {
  rank: number;
  name: string;
  points: number;
};
