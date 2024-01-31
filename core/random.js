const fs = require('fs');
const path = require('path');

const QUESTIONS_DIR_PATH = 'interview-questions';
const QUESTIONS_FILE_PATH = `../${QUESTIONS_DIR_PATH}/01-1주차~3주차.json`;

/**
 * JSON 파일에서 질문 배열을 읽어온다.
 * @returns {string[]}
 */
const readQuestionsFromFile = () => {
  try {
    const fullPath = path.resolve(__dirname, QUESTIONS_FILE_PATH);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const questionsJson = JSON.parse(fileContents);
    return questionsJson.questions;
  } catch (error) {
    console.error('파일을 읽어오는 중 에러가 발생했습니다.', error);
    return [];
  }
};

/**
 * 주어진 배열에서 무작위로 3개의 요소를 선택한다.
 * @param {string[]} array
 * @returns {string[]}
 */
const selectRandomElements = (array, numElements = 3) => {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numElements);
};

const main = () => {
  const questions = readQuestionsFromFile();
  return selectRandomElements(questions);
};

console.log(main());
