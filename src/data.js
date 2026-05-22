// 트랙 식별자(API 값) → 한국어 레이블
const TRACK_LABELS = {
  BACKEND: '백엔드',
  FRONTEND: '프론트엔드',
  MOBILE: '모바일',
};

// 미션 슬러그(API 값) → 한국어 이름 + 아이콘
const MISSION_META = {
  roomescape: { name: '방탈출 사용자 예약', icon: 'fa-door-open' },
  shopping: { name: '쇼핑 주문', icon: 'fa-cart-shopping' },
  payments: { name: '페이먼츠', icon: 'fa-credit-card' },
};

// API 미응답 시 사용할 폴백 트랙 목록
// GitHub ID → 우테코 닉네임 매핑
const REVIEWER_NICKNAMES = {
  // 백엔드
  Gyuchool: '기론',
  younghoondoodoom: '두둠',
  robinjoon: '로빈',
  Rok93: '로키',
  hyeonic: '매트',
  Arachneee: '백호',
  'verus-j': '베루스',
  pci2676: '비밥',
  her0807: '수달',
  syoun602: '썬',
  donghoony: '아루',
  NewWisdom: '아마찌',
  Hyunta: '아서',
  echo724: '에코',
  choijy1705: '영이',
  sihyung92: '웨지',
  yenawee: '제나',
  jamie9504: '제이미',
  'Choi-JJunho': '주노',
  jurlring: '주디',
  Gomding: '찰리',
  Chocochip101: '초코칩',
  include42: '카프카',
  pkeugine: '피케이',
  // 프론트엔드
  eastroots92: '루트',
  ukkodeveloper: '우코',
  JUDONGHYEOK: '동키콩',
  degurii: '데구리',
  coolchaem: '조이',
  'jw-r': '우디',
  cys4585: '수야',
  // 안드로이드
  'Gyuil-Hwnag': '두루',
  krrong: '크롱',
  malibinYun: '말리빈',
  SeongHoonC: '베르',
  'lee-ji-hoon': '코니',
};

export const reviewerNickname = (id) => REVIEWER_NICKNAMES[id] ?? id;

export const FALLBACK_TRACKS = ['BACKEND', 'FRONTEND', 'MOBILE'].map(
  (track) => ({ track, documentCount: 0 }),
);

export const trackLabel = (track) => TRACK_LABELS[track] ?? track;
export const missionDisplayName = (slug) => MISSION_META[slug]?.name ?? slug;
export const missionIcon = (slug) => MISSION_META[slug]?.icon ?? 'fa-code';
