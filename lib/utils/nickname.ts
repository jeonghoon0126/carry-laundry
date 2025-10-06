/**
 * 랜덤 닉네임 생성 유틸리티
 */

const adjectives = [
  '친절한', '깔끔한', '빠른', '신뢰할만한', '편리한', '깨끗한',
  '안전한', '정확한', '효율적인', '만족스러운', '훌륭한', '완벽한',
  '따뜻한', '부드러운', '신선한', '깨끗한', '밝은', '상쾌한'
];

const nouns = [
  '세탁왕', '세탁의달인', '깔끔이', '세탁소', '세탁매니저', '세탁전문가',
  '깨끗이', '빠른이', '세탁마스터', '깨끗왕', '세탁고수', '세탁달인',
  '친절이', '편리이', '안전이', '정확이', '효율이', '만족이'
];

export function generateRandomNickname(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}`;
}

export function generateNicknameWithNumber(): string {
  const baseNickname = generateRandomNickname();
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  return `${baseNickname}${randomNumber}`;
}