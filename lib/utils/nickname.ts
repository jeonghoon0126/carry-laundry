const CUTE_PREFIXES = [
  "고양이",
  "멍멍이", 
  "토끼",
  "곰돌이",
  "펭귄",
  "다람쥐",
  "문어",
  "해달"
]

export function generateNickname(): string {
  const prefix = CUTE_PREFIXES[Math.floor(Math.random() * CUTE_PREFIXES.length)]
  const number = Math.floor(Math.random() * 900) + 100 // 100-999
  return `${prefix}${number}`
}



