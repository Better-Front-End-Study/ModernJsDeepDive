import { input } from '@inquirer/prompts';

const answer = await input({ message: '이름을 입력해주세요.' });

console.log(`제 이름은 ${answer}입니다.`);
