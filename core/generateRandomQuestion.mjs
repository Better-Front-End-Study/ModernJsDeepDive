import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import inquirer from "inquirer";
import chalk from "chalk";

const QUESTIONS_DIR_PATH = "interview-questions";

/**
 * 지정된 디렉토리 내의 모든 파일 이름을 반환한다.
 * @returns {string[]}
 */

// 현재 파일의 URL을 파일 경로로 변환
const __filename = fileURLToPath(import.meta.url);

// __filename에서 디렉토리 경로를 얻음
const __dirname = path.dirname(__filename);

// 전체 면접 질문
let allQuestions = [];

// 남은 면접 질문
let remainingQuestions = [];

// 면접 참여자
let interviewees = [];

// 현재 피면접자를 추적하는 변수
let currentIntervieweeIndex = 0;

/**
 * 파일명 리스트를 반환합니다.
 * @returns {string[]}
 */
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
    const filePath = path.resolve(
      __dirname,
      `../${QUESTIONS_DIR_PATH}/${fileName}`
    );
    const fileContents = fs.readFileSync(filePath, "utf8");
    const questionsJson = JSON.parse(fileContents);
    return questionsJson;
  } catch (error) {
    console.error("파일을 읽는 도중 에러가 발생하였습니다.", error);
    return [];
  }
};

/**
 * 배열을 무작위로 섞는 함수.
 * @param {any[]} array - 섞고자 하는 원본 배열.
 * @returns {any[]} 무작위로 섞인 새 배열.
 */
const shuffleArray = (array) => {
  return array.sort(() => 0.5 - Math.random());
};

/**
 * 주어진 배열에서 무작위로 n개의 요소를 선택한다. (default=3)
 * @param {string[]} array 원본배열
 * @returns {string[]} 무작위로 섞인 새 배열
 */
const selectRandomElements = (array, numElements = 3) => {
  return shuffleArray(array).slice(0, numElements);
};

/**
 * 주어진 배열에서 피면접자 질문을 제외한다.
 * @param {string[]} array 원본배열
 * @param {string} interviewee 피면접자
 * @returns {string[]} 무작위로 섞인 새 배열
 */
const exceptOwnQuestion = (array, interviewee) => {
  return array.filter(({ author }) => author !== interviewee);
};

/**
 * 사용자가 엔터키를 누를 때까지 기다린다.
 * @returns {Promise<void>}
 **/
const waitForEnter = (message = "계속하려면 엔터키를 눌러주세요...👍\n") => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(message, (ans) => {
      rl.close();
      resolve();
    })
  );
};

/**
 * 피면접자 입력받아 저장
 * @param {*} num {number}
 */
const askForIntervieweeNames = async (num) => {
  const questions = [];
  for (let i = 0; i < num; i++) {
    questions.push({
      type: "input",
      name: `interviewee${i}`,
      message: `멋쟁이 참석자 #${i + 1}의 이름은?`,
    });
  }

  const answers = await inquirer.prompt(questions);
  interviewees = Object.values(answers);
  console.log(`${interviewees} 의 면접을 시작합니다 ( ˙◞˙ )`);

  // 피면접자 순서를 섞어요
  interviewees = shuffleArray(interviewees);
};

const main = async () => {
  // 피면접자 수와 이름 입력받기
  const { numInterviewees } = await inquirer.prompt([
    {
      type: "input",
      name: "numInterviewees",
      message: "참여한 면접자 수를 입력해주세요:",
      validate: (input) =>
        input !== "" && !isNaN(input) && parseInt(input) > 0
          ? true
          : "유효한 숫자를 입력해주세요!",
    },
  ]);

  await askForIntervieweeNames(parseInt(numInterviewees));

  if (!allQuestions.length) {
    const files = getFilesFromDirectory();
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "selectedFile",
        message: "질문 파일을 선택해주세요.",
        choices: files,
      },
    ]);
    allQuestions = readQuestionsFromFile(answers.selectedFile);
    remainingQuestions = [...allQuestions];
  }

  while (remainingQuestions.length) {
    // 여기서 문제 수를 조절해요 (현재 3문제)
    const numElements = Math.min(3, remainingQuestions.length);

    // 현재 피면접자 선택
    const selectedInterviewee = interviewees[currentIntervieweeIndex];

    // 문제 배열 무작위로 섞어서 문제 3개 뽑기
    const selectedQuestions = selectRandomElements(
      exceptOwnQuestion(remainingQuestions, selectedInterviewee),
      numElements
    );

    await waitForEnter(`답변자: ${chalk.bold.green(selectedInterviewee)}\n`);

    for (let i = 0; i < selectedQuestions.length; i++) {
      const { question, keyword, author } = selectedQuestions[i];

      await waitForEnter(
        `${chalk.red("❤️")} ${i + 1}번째 질문 ${chalk.red(
          "❤️"
        )} (${chalk.bold.blue(author)})\n ${chalk.bold.yellow(
          question
        )} \n keyword: ${chalk.gray(keyword)} \n `
      );
    }

    // Remove the selected questions from the remaining questions
    remainingQuestions = remainingQuestions.filter(
      (question) => !selectedQuestions.includes(question)
    );

    // 다음 피면접자로 이동
    currentIntervieweeIndex =
      (currentIntervieweeIndex + 1) % interviewees.length;

    // if (remainingQuestions.length) {
    //   await waitForEnter();
    // }
  }

  console.log("모든 질문이 선택되었습니다. 다음에 또 만나요!😎");
};

main().catch((error) => {
  console.error("😅에러가 발생하였어요.😅\n ", error);
});
