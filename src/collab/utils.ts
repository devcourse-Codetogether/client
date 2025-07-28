import { faker } from '@faker-js/faker';

export const getRandomName = () => {
  const randomName = faker.person.fullName();
  return randomName;
};

export const getRandomColor = () => {
  // 랜덤 HEX 색상 코드 생성
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
