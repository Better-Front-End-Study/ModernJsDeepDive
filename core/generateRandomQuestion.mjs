import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import inquirer from 'inquirer';

const QUESTIONS_DIR_PATH = 'interview-questions';

/**
 * 지정된 디렉토리 내의 모든 파일 이름을 반환한다.
 * @returns {string[]}
 */

// 현재 파일의 URL을 파일 경로로 변환
const __filename = fileURLToPath(import.meta.url);
// __filename에서 디렉토리 경로를 얻음
const __dirname = path.dirname(__filename);

let allQuestions = [];
let remainingQuestions = [];

const getFilesFromDirectory = () => {
  const directoryPath = path.resolve(__dirname, `../${QUESTIONS_DIR_PATH}`);
  return fs.readdirSync(directoryPath);
};

/**
 * 지정된 파일에서 질문 배열을 읽어온다.
 * @param {string} fileName - 파일 이름
 * @returns {string[]}
 */
const readQuestionsFromFile = (fileName) => {
  try {
    const filePath = path.resolve(__dirname, `../${QUESTIONS_DIR_PATH}/${fileName}`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const questionsJson = JSON.parse(fileContents);
    return questionsJson.questions;
  } catch (error) {
    console.error('파일을 읽는 도중 에러가 발생하였습니다.', error);
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

/**
 * 사용자가 엔터키를 누를 때까지 기다린다.
 * @returns {Promise<void>}
 **/
const waitForEnter = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question('계속하려면 엔터키를 눌러주세요...👍', (ans) => {
      rl.close();
      resolve();
    })
  );
};

const main = async () => {
  if (!allQuestions.length) {
    const files = getFilesFromDirectory();
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFile',
        message: '질문 파일을 선택해주세요.',
        choices: files,
      },
    ]);
    allQuestions = readQuestionsFromFile(answers.selectedFile);
    remainingQuestions = [...allQuestions];
  }

  while (remainingQuestions.length) {
    const numElements = Math.min(3, remainingQuestions.length);
    const selectedQuestions = selectRandomElements(remainingQuestions, numElements);
    console.log('❤️질문 입니다.❤️\n ', selectedQuestions);

    // Remove the selected questions from the remaining questions
    remainingQuestions = remainingQuestions.filter((question) => !selectedQuestions.includes(question));

    if (remainingQuestions.length) {
      await waitForEnter();
    }
  }

  console.log('모든 질문이 선택되었습니다. 다음에 또 만나요!😎');
};

main().catch((error) => {
  console.error('😅에러가 발생하였어요.😅\n ', error);
});
