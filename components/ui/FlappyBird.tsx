interface FlappyBirdProps {
  className?: string;
}

export default function FlappyBird({ className = "" }: FlappyBirdProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      {/* 몸통 (노란색/주황색) */}
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="#F9D71C" />
      <ellipse cx="50" cy="60" rx="30" ry="22" fill="#F5AB35" />

      {/* 배 (연한 크림색) */}
      <ellipse cx="55" cy="62" rx="18" ry="16" fill="#FFF8DC" />

      {/* 눈 (흰색 배경) */}
      <circle cx="62" cy="42" r="14" fill="white" />
      <circle cx="62" cy="42" r="12" stroke="#333" strokeWidth="2" fill="white" />

      {/* 눈동자 */}
      <circle cx="65" cy="42" r="6" fill="#333" />
      <circle cx="67" cy="40" r="2" fill="white" />

      {/* 부리 (주황/빨강) */}
      <path d="M 75 52 L 95 55 L 75 62 Z" fill="#E84A3C" />
      <path d="M 75 52 L 95 55 L 75 56 Z" fill="#F39C12" />

      {/* 날개 */}
      <ellipse cx="30" cy="55" rx="15" ry="10" fill="#E8B923" />
      <ellipse cx="28" cy="55" rx="10" ry="6" fill="#D4A017" />

      {/* 꼬리 */}
      <path d="M 15 50 Q 5 45 10 55 Q 5 65 15 60 Z" fill="#E8B923" />
    </svg>
  );
}
