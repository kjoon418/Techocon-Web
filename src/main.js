import './style.css';
import { marked } from 'marked';
import { searchReviews, getTracks, getMissions } from './api.js';
import { trackLabel, missionDisplayName, missionIcon, FALLBACK_TRACKS, reviewerNickname } from './data.js';

marked.use({ gfm: true, breaks: true });

const PAGE_SIZE = 5;

// ─── 로딩 팩트 ───────────────────────────────────────────────────────────────

const FACTS = [
  '알고 계셨나요? 최초의 컴퓨터 버그는 1947년 그레이스 호퍼가 마크 II 컴퓨터 회로에서 발견한 진짜 \'나방\'이었답니다.',
  '알고 계셨나요? 세계 최초의 프로그래머는 19세기 수학자이자 시인 바이런의 딸이었던 \'에이다 러브레이스\'라는 여성입니다.',
  '알고 계셨나요? 객체 지향 프로그래밍(OOP)은 생각보다 오래된 1960년대 후반 \'시뮬라 67\'이라는 언어에서 처음 등장했답니다.',
  '알고 계셨나요? 자바스크립트는 1995년 브렌던 아이크가 단 10일 만에 프로토타입을 설계하고 개발한 언어입니다.',
  '알고 계셨나요? 리눅스의 창시자 리누스 토르발스는 원래 Git을 단 2주 만에 자체적으로 쓸 목적으로 뚝딱 만들었습니다.',
  '알고 계셨나요? 파이썬(Python)이라는 이름은 뱀이 아니라 영국 코미디 그룹 \'몬티 파이썬\'의 열혈 팬이었던 창시자의 취향에서 왔습니다.',
  '알고 계셨나요? 자바(Java)의 원래 이름은 창시자 제임스 고슬링 사무실 밖에 있던 나무를 본떠 만든 \'오크(Oak)\'였습니다.',
  '알고 계셨나요? 최초의 웹 브라우저인 월드와이드웹(WorldWideWeb)은 개발자가 NeXT 컴퓨터에서 단 몇 달 만에 개발했습니다.',
  '알고 계셨나요? C 언어는 \'B 언어\'의 후속작으로 만들어졌으며, B 언어는 \'BCPL\'이라는 언어에서 파생되었습니다.',
  '알고 계셨나요? 세계 최초의 컴퓨터 게임은 1962년 MIT에서 PDP-1 컴퓨터용으로 개발된 \'스페이스워!(Spacewar!)\'입니다.',
  '알고 계셨나요? PHP는 원래 \'Personal Home Page\'의 약자였으나, 현재는 \'PHP: Hypertext Preprocessor\'라는 재귀적 약자로 쓰입니다.',
  '알고 계셨나요? 최초의 이메일은 1971년 레이 톰린슨이 보냈으며, 이때 이메일 주소 구분을 위해 @ 기호가 처음 도입되었습니다.',
  '알고 계셨나요? \'스팸(Spam)\' 메일이라는 단어는 몬티 파이썬의 코미디 스케치 중 스팸 통조림이 반복해서 나오는 장면에서 유래했습니다.',
  '알고 계셨나요? 최초의 3D 그래픽 게임 중 하나인 \'둠(Doom, 1993)\'은 하드웨어 한계를 극복하기 위해 BSP 트리라는 수학적 기법을 썼습니다.',
  '알고 계셨나요? SQL은 원래 1970년대 IBM에서 개발할 당시 \'SEQUEL\'이라고 불렸으나 상표권 문제로 철자를 변경했습니다.',
  '알고 계셨나요? C++은 원래 C 언어에 객체지향을 더했다는 의미에서 \'C with Classes\'라는 직관적인 이름으로 시작되었습니다.',
  '알고 계셨나요? 인터넷의 기반이 된 ARPANET은 원래 핵전쟁 속에서도 살아남는 통신망을 구축하기 위해 설계된 프로젝트였습니다.',
  '알고 계셨나요? 인텔의 최초 상용 마이크로프로세서인 4004는 원래 일본의 한 전자계산기 회사 주문으로 만들어진 칩이었습니다.',
  '알고 계셨나요? 와이파이(Wi-Fi)라는 이름은 어떤 기술적 약자도 아니며, 단순히 마케팅 회사가 \'하이파이(Hi-Fi)\' 오디오에서 따와 만든 브랜드입니다.',
  '알고 계셨나요? 전설적인 프로그래밍 서적 \'SICP(컴퓨터 프로그램의 구조와 해석)\'의 표지에는 마법사와 마법진이 그려져 있답니다.',
  '알고 계셨나요? 자바스크립트의 NaN(Not a Number)은 데이터 타입(typeof)을 검사하면 역설적이게도 number가 나옵니다.',
  '알고 계셨나요? 자바스크립트에서 0.1 + 0.2를 계산하면 이진 부동소수점 한계 때문에 0.30000000000000004가 됩니다.',
  '알고 계셨나요? 구글(Google)의 이름은 10의 100제곱을 뜻하는 수학 용어 \'구골(Googol)\'의 철자를 실수로 잘못 적어 탄생했습니다.',
  '알고 계셨나요? JSON 데이터 포맷은 XML의 복잡함에 지친 더글라스 크락포드가 자바스크립트 문법을 빌려 대중화시켰습니다.',
  '알고 계셨나요? C 언어의 printf에서 f는 \'formatted\'의 약자로, 서식을 지정해 출력한다는 뜻을 담고 있습니다.',
  '알고 계셨나요? JSON에는 주석(//)을 공식적으로 넣을 수 없는데, 이는 창시자가 사람들이 주석에 파싱 옵션을 넣는 오용을 막기 위함이었습니다.',
  '알고 계셨나요? CSS의 우선순위는 \'구체성 점수\'로 계산되는데, 인라인 스타일은 ID 선택자보다 항상 압도적으로 높은 점수를 가집니다.',
  '알고 계셨나요? 텍스트 인코딩 표준인 UTF-8은 유닉스의 대가 켄 톰슨과 롭 파이크가 돗자리 깔고 앉아 식당 매트에 구상한 결과물입니다.',
  '알고 계셨나요? 기계어에 가까운 \'어셈블리어\'도 엄밀히 따지면 사람이 읽을 수 있는 텍스트 형태의 고급(?) 언어에 속한답니다.',
  '알고 계셨나요? 정규표현식(Regex)의 뿌리는 1950년대 수학자 스티븐 클레이니가 인간의 신경망 구조를 수학적으로 묘사하려던 연구였습니다.',
  '알고 계셨나요? 가비지 컬렉션(GC) 개념은 1959년 존 매카시가 인공지능용 언어인 Lisp을 관리하기 위해 처음 발명했습니다.',
  '알고 계셨나요? 관계형 데이터베이스(RDBMS)의 기초를 다진 에드거 F. 커드는 수학의 \'집합론\'을 기반으로 논문을 작성했습니다.',
  '알고 계셨나요? HTTP 상태 코드 404 Not Found는 룸 번호 404호에서 중앙 데이터베이스를 관리했다는 루머가 있으나, 사실은 그냥 임의의 숫자 조합입니다.',
  '알고 계셨나요? HTTP 418 I\'m a teapot은 1998년 만우절 장난(RFC 2324)으로 제정된 진짜 표준 상태 코드 중 하나입니다.',
  '알고 계셨나요? 맥OS의 기반인 \'다윈(Darwin)\'은 오픈소스 유닉스 계열 운영체제이며, 그 핵심에는 마하(Mach) 커널이 있습니다.',
  '알고 계셨나요? 블루투스(Bluetooth)라는 이름은 10세기 바이킹 왕 \'하랄드 블라탄\'의 별명(푸른 이빨)에서 따온 통합 인프라의 상징입니다.',
  '알고 계셨나요? 비주얼 스튜디오 코드(VS Code)는 놀랍게도 웹 브라우저 엔진(크로미움) 위에서 돌아가는 일종의 웹 애플리케이션입니다.',
  '알고 계셨나요? 대다수 정렬 알고리즘의 기준이 되는 퀵 정렬(Quick Sort)은 1959년 토니 호어가 러시아어 기계 번역을 연구하다 개발했습니다.',
  '알고 계셨나요? 파이썬에는 import this를 입력하면 파이썬의 철학을 담은 19가지 시(The Zen of Python)가 출력되는 이스터 에그가 있습니다.',
  '알고 계셨나요? 블록체인의 비트코인 네트워크는 전 세계 수많은 노드가 10분마다 한 번씩 주사위를 굴려 특정 숫자를 맞추는 게임과 같습니다.',
  '알고 계셨나요? 아폴로 11호를 달로 보낸 컴퓨터(AGC)의 메모리는 고작 74KB였으며, 이는 오늘날 이메일 한 통 용량보다 작습니다.',
  '알고 계셨나요? 아폴로 11호 컴퓨터의 메모리는 구리선에 코어를 사람이 일일이 손으로 엮어 만든 \'로프 메모리\'였습니다.',
  '알고 계셨나요? 1970년대 마이크로프로세서 개발자들은 칩의 실리콘 위에 현미경으로만 볼 수 있는 만화 캐릭터 등의 작은 그림을 숨겨두곤 했습니다.',
  '알고 계셨나요? 컴퓨터 소수점 연산의 국제 표준인 IEEE 754를 제정할 때, 수학적 정확성과 하드웨어 구현 효율을 두고 엄청난 논쟁이 있었습니다.',
  '알고 계셨나요? 솔리드 스테이트 드라이브(SSD)는 데이터를 저장할 때 플래시 메모리 셀에 전자를 가두는 방식을 사용합니다.',
  '알고 계셨나요? 전 세계 바다 밑에는 대륙과 대륙을 연결하는 거대한 광케이블 수백 개가 깔려 있어 우리가 해외 사이트에 접속할 수 있는 거랍니다.',
  '알고 계셨나요? 대형 데이터 센터들은 서버 열을 식히기 위해 아예 북극 근처에 짓거나 바다 깊은 곳에 데이터 센터를 빠뜨리는 실험을 합니다.',
  '알고 계셨나요? 키보드의 QWERTY 배열은 타자기가 너무 빨리 치면 엉키는 문제를 막기 위해 일부러 자주 쓰는 철자를 멀리 떨어뜨려 놓은 구조입니다.',
  '알고 계셨나요? 컴퓨터 마우스의 첫 프로토타입은 1963년 더글라스 엥겔바트가 나무 토막과 두 개의 바퀴를 이용해 만들었습니다.',
  '알고 계셨나요? Y2K 버그는 메모리를 아끼기 위해 연도를 뒤의 두 자리(예: 99)로만 기록하던 습관 때문에 수천억 달러의 비용을 치르게 했습니다.',
  '알고 계셨나요? 무어의 법칙(반도체 집적도가 2년마다 배로 증가한다)은 물리적 한계에 부딪혀 최근에는 \'황의 법칙\' 등 새로운 패러다임으로 대체되고 있습니다.',
  '알고 계셨나요? 전 세계 인터넷의 타임서버(NTP)들은 원자시계를 기준으로 작동하며, 가끔 지구 자전 속도 맞추려고 \'윤초\'를 더하기도 합니다.',
  '알고 계셨나요? 폰 노이만 구조는 프로그램 데이터와 코드를 같은 메모리에 올리는 방식으로, 오늘날 거의 모든 컴퓨터의 뼈대가 되었습니다.',
  '알고 계셨나요? CPU 내부의 캐시 메모리(L1, L2, L3)는 메인 메모리(RAM)보다 속도가 수십 배 빠르지만 단가가 비싸 용량이 작습니다.',
  '알고 계셨나요? 그래픽 카드(GPU)가 코인 채굴이나 AI 연산에 강한 이유는, 복잡한 연산 대신 단순한 사칙연산을 수천 개씩 동시에 처리할 수 있어서입니다.',
  '알고 계셨나요? 하드디스크(HDD) 헤드는 디스크 표면 위를 머리카락 굵기의 수만 분의 일 크기 간격으로 아슬아슬하게 비행하며 데이터를 읽습니다.',
  '알고 계셨나요? 컴퓨터가 진짜 \'무작위 숫자(진정한 난수)\'를 만드는 건 어려워서, 보통은 현재 시간 값(Seed)을 변형한 의사 난수를 사용합니다.',
  '알고 계셨나요? 구글은 실제 서버실의 무작위성을 확보하기 위해 \'용암 램프(Lava Lamp)\'의 움직임을 카메라로 촬영해 난수 생성에 쓰기도 합니다.',
  '알고 계셨나요? 라즈베리 파이(Raspberry Pi)는 원래 영국의 학교에서 아이들에게 기초 컴퓨터 과학을 저렴하게 가르치려고 만든 교육용 보드입니다.',
  '알고 계셨나요? 임베디드 시스템에서 가장 널리 쓰이는 운영체제 중 하나인 실시간 OS(RTOS)는 마이크로초 단위의 엄격한 시간 초과를 보장합니다.',
  '알고 계셨나요? 깃허브(GitHub)의 마스코트인 \'옥토캣(Octocat)\'은 문어 다리를 가진 고양이 캐릭터로, 고양이 이름은 \'모나(Mona)\'입니다.',
  '알고 계셨나요? 아마존(Amazon)은 초기에 단순히 책을 파는 온라인 서점이었으나, 서버 인프라를 효율화하다 보니 지금의 AWS가 되었습니다.',
  '알고 계셨나요? 넷플릭스는 서버가 갑자기 죽는 상황을 대비하기 위해, 낮 시간에 라이브 서버를 무작위로 다운시키는 \'카오스 몽키\'라는 툴을 돌립니다.',
  '알고 계셨나요? 도커(Docker)의 고래 아이콘 위에 쌓인 컨테이너들은 조선소나 항구에서 쓰는 실제 컨테이너선에서 영감을 얻은 브랜딩입니다.',
  '알고 계셨나요? 자바의 마스코트인 \'듀크(Duke)\'는 원래 인터랙티브 TV 소프트웨어를 위해 디자인된 일종의 에이전트 캐릭터였습니다.',
  '알고 계셨나요? 마이크로소프트가 오픈소스의 상징인 깃허브(GitHub)를 인수할 당시, 많은 오픈소스 개발자들이 대공황에 빠졌으나 지금은 잘 쓰고 있죠.',
  '알고 계셨나요? 안드로이드 운영체제 버전은 원래 컵케이크, 도넛, 에클레어 등 알파벳 순서대로 디저트 이름을 붙이는 전통이 있었습니다.',
  '알고 계셨나요? Stack Overflow에서 가장 추천을 많이 받은 답변 중 하나는 "자바스크립트로 HTML을 정규식으로 파싱하지 마라"는 경고 섞인 한탄입니다.',
  '알고 계셨나요? 트위터(X)는 초기에 Ruby on Rails로 개발되었으나, 트래픽 폭발로 인한 \'실패 고래\' 화면을 없애기 위해 백엔드를 Scala로 바꿨습니다.',
  '알고 계셨나요? 페이스북이 개발한 React는 원래 웹페이지 전체를 매번 새로 고치는 불편함을 없애기 위해 내부 뉴스피드용으로 고안되었습니다.',
  '알고 계셨나요? 쿠버네티스(Kubernetes)의 로고가 7각형인 이유는, 구글 내부의 비밀 프로젝트였던 \'프로젝트 7(Project 7)\'에서 유래했기 때문입니다.',
  '알고 계셨나요? 오픈소스 라이선스 중 MIT 라이선스는 "이 소프트웨어로 뭘 하든 상관없지만, 문제가 생겨도 내 책임은 아니다"라는 게 핵심입니다.',
  '알고 계셨나요? GNU 프로젝트의 리처드 스톨만은 프린터 소스코드를 고치지 못하게 막은 영리 기업에 분노해 카피레프트(Copyleft) 운동을 시작했습니다.',
  '알고 계셨나요? 윈도우 95 소스코드에는 맥OS 호환 프로그램이나 구형 DOS 게임들이 튕기지 않도록 예외 처리를 해둔 더러운(?) 코드가 가득했습니다.',
  '알고 계셨나요? 스타크래프트 1의 네트워킹 코드는 패킷을 아끼기 위해 유닛의 좌표 대신 \'플레이어의 명령 데이터\'만 서로 주고받는 구조였습니다.',
  '알고 계셨나요? 애플의 스티브 잡스가 픽사(Pixar)를 인수했을 때, 픽사는 원래 하이엔드 그래픽 처리용 컴퓨터를 파는 하드웨어 회사였습니다.',
  '알고 계셨나요? 리눅스 커널 소스코드에는 가끔 개발자들이 화가 나 적어둔 욕설이나 비속어가 주석으로 고스란히 남아 있어 검색해 볼 수 있습니다.',
  '알고 계셨나요? 세계에서 가장 유명한 폰트 중 하나인 \'Comic Sans\'는 마이크로소프트의 어린이용 소프트웨어 가이드 댕댕이를 위해 개발되었습니다.',
  '알고 계셨나요? 우분투(Ubuntu) 리눅스의 이름은 "네가 있으니 내가 있다"라는 뜻의 아프리카 반투어 명사에서 따온 공동체 정신의 상징입니다.',
  '알고 계셨나요? 아이폰이 처음 출시되었을 때 스티브 잡스는 외부 개발자 앱(App) 생태계 대신 \'웹 앱\'으로 만족하라고 주장했었습니다.',
  '알고 계셨나요? 프로그래머의 불문율인 \'Hello, World!\' 출력은 브라이언 커니핸이 B 언어 튜토리얼 문서에서 처음 사용하며 유행했습니다.',
  '알고 계셨나요? 프로그래밍에서 foo, bar, baz 같은 의미 없는 변수명은 군대 용어인 FUBAR(완전 엉망진창임) 등에서 유래했다는 설이 유력합니다.',
  '알고 계셨나요? \'고무 오리 디버깅(Rubber Duck Debugging)\'은 아무 말 없는 오리 인형에게 코드를 한 줄씩 말로 설명하다가 스스로 깨닫는 기법입니다.',
  '알고 계셨나요? 타임스탬프의 기준인 에포크 타임(Epoch Time)은 1970년 1월 1일 00:00:00 UTC 기점으로 흘러간 초(second)를 나타냅니다.',
  '알고 계셨나요? 32비트 정수형 타임스탬프는 2038년 1월 19일에 최대치를 초과해 버그를 일으키는 \'2038년 문제\'를 안고 있어 64비트로 바꾸는 중입니다.',
  '알고 계셨나요? 코드 가독성을 논할 때 쓰는 \'카멜 케이스(camelCase)\'는 단어 연결 부위가 낙타 등 표면의 혹처럼 튀어나왔다고 해서 붙은 이름입니다.',
  '알고 계셨나요? \'스네이크 케이스(snake_case)\'는 단어 사이에 언더바(_)를 넣어 마치 뱀이 바닥을 기어가는 모습처럼 보인다고 해서 붙었습니다.',
  '알고 계셨나요? 암호학에서 자주 쓰이는 \'앨리스와 밥(Alice and Bob)\'은 1978년 RSA 암호 논문에서 송수신자를 설명하기 위해 처음 도입되었습니다.',
  '알고 계셨나요? 테트리스(Tetris) 게임은 러시아의 프로그래머 알렉세이 파지노프가 전자공학 연구소에서 일하다가 심심풀이로 만든 게임입니다.',
  '알고 계셨나요? "소프트웨어 공학에는 은탄환(은화살)이 없다"라는 명언은 복잡한 소프트웨어 문제를 한 방에 해결할 완벽한 기술은 없다는 뜻입니다.',
  '알고 계셨나요? 리누스의 법칙에 따르면, "보는 눈(개발자)이 충분히 많으면 어떤 버그든 쉽게 찾아낼 수 있다"고 합니다.',
  '알고 계셨나요? 폰 노이만은 뇌졸중으로 병상에 누워 죽어갈 때도 암산으로 복잡한 미적분 문제를 풀며 의사들을 경악시켰습니다.',
  '알고 계셨나요? 컴퓨터 과학의 난제인 P vs NP 문제는 "답을 검산하기 쉬운 문제는 풀기도 쉬울까?"라는 질문을 수학적으로 증명하는 것입니다.',
  '알고 계셨나요? 코딩할 때 쓰는 탭(Tab)과 스페이스(Space) 공백 논쟁은 미드 \'실리콘 밸리\'에서 연인들이 이것 때문에 헤어지는 에피소드로 다뤄졌습니다.',
  '알고 계셨나요? \'해커(Hacker)\'라는 말은 원래 MIT의 철도 모델 동아리에서 기계를 기발하게 개조하던 학생들을 부르던 긍정적인 단어였습니다.',
  '알고 계셨나요? 세상을 바꾼 알고리즘 중 하나인 \'패스트 푸리에 변환(FFT)\'은 냉전 시대에 소련의 핵실험 여부를 탐지하기 위해 고안되었습니다.',
  '알고 계셨나요? 체스 챔피언 가리 카스파로프를 꺾은 IBM의 \'딥 블루\'는 딥러닝이 아니라 무수한 수 알고리즘을 무차별 대입한 브루트 포스에 가까웠습니다.',
  '알고 계셨나요? \'도널드 크누스\' 교수가 쓴 프로그래밍의 성서 \'TAOCP\' 책에서 버그를 찾아 제보하면 교수가 직접 서명한 2.56달러짜리 수표를 줍니다.',
  '알고 계셨나요? 콘웨이의 법칙에 따르면, "소프트웨어 구조는 그것을 만드는 개발 조직의 소통 구조와 닮아가게 마련"이라고 합니다.',
  '알고 계셨나요? 지금 보시는 이 수많은 정보의 바다 인터넷도, 본질은 결국 0과 1이라는 단 두 개의 신호가 무한히 반복되며 만들어 낸 기적입니다.',
];

let factsOrder = [];
let currentFactIndex = 0;
let factTimer = null;

function shuffleFacts() {
  factsOrder = [...Array(FACTS.length).keys()];
  for (let i = factsOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [factsOrder[i], factsOrder[j]] = [factsOrder[j], factsOrder[i]];
  }
  currentFactIndex = 0;
}

function currentFact() {
  return FACTS[factsOrder[currentFactIndex] ?? 0];
}

function updateFactDOM(direction = 'next') {
  const el = document.getElementById('loading-fact');
  if (!el) return;

  const exitX = direction === 'next' ? '-24px' : '24px';
  const enterX = direction === 'next' ? '24px' : '-24px';

  // 나가는 애니메이션
  el.style.transition = 'transform 180ms ease, opacity 180ms ease';
  el.style.transform = `translateX(${exitX})`;
  el.style.opacity = '0';

  setTimeout(() => {
    el.textContent = currentFact();
    // 들어오는 시작 위치 (transition 없이 순간 이동)
    el.style.transition = 'none';
    el.style.transform = `translateX(${enterX})`;
    el.style.opacity = '0';
    // 강제 리플로우로 transition 적용 보장
    el.offsetHeight; // eslint-disable-line no-unused-expressions
    // 들어오는 애니메이션
    el.style.transition = 'transform 180ms ease, opacity 180ms ease';
    el.style.transform = 'translateX(0)';
    el.style.opacity = '1';
  }, 180);
}

function nextFact() {
  currentFactIndex = (currentFactIndex + 1) % factsOrder.length;
  updateFactDOM('next');
  startFactTimer();
}

function prevFact() {
  currentFactIndex = (currentFactIndex - 1 + factsOrder.length) % factsOrder.length;
  updateFactDOM('prev');
  startFactTimer();
}

function startFactTimer() {
  clearFactTimer();
  factTimer = setInterval(nextFact, 5000);
}

function clearFactTimer() {
  if (factTimer) { clearInterval(factTimer); factTimer = null; }
}

const state = {
  track: null,      // 선택된 트랙 (API 값, e.g. 'BACKEND')
  mission: null,    // 선택된 미션 슬러그 (e.g. 'roomescape')
  search: '',
  tracks: [],       // TrackOption[] — /api/tracks 응답
  missions: [],     // MissionOption[] — /api/missions 응답
  results: null,    // SearchResponse | null
  loading: false,
  error: null,
  displayCount: PAGE_SIZE,
};

// ─── 초기화 ─────────────────────────────────────────────────────────────────

async function init() {
  document.getElementById('app').innerHTML = buildLayout();
  attachEventListeners();
  renderResults();
  await loadTracks();
}

async function loadTracks() {
  try {
    state.tracks = await getTracks();
  } catch {
    state.tracks = FALLBACK_TRACKS;
  }
  if (state.tracks.length > 0) {
    state.track = state.tracks[0].track;
  }
  refreshFilterButtons();
  await loadMissions();
}

async function loadMissions() {
  try {
    state.missions = await getMissions(state.track);
  } catch {
    state.missions = [];
  }
  if (!state.mission && state.missions.length > 0) {
    state.mission = state.missions[0].name;
  }
  refreshFilterButtons();
}

// ─── 레이아웃 ────────────────────────────────────────────────────────────────

function buildLayout() {
  return `
    <div class="max-w-[1000px] w-full min-h-screen bg-white text-[#1A1A1A] mx-auto">
      <header class="sticky top-0 z-50 w-full h-[72px] bg-white/80 backdrop-blur-md border-b border-[#EEEEEE] flex items-center justify-between px-[40px]">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="Reveiwoowacourse 로고" class="w-9 h-9 object-contain">
          <span class="text-lg font-bold tracking-tight">Reveiwoowacourse</span>
        </div>
      </header>

      <main class="px-[40px] py-[48px]">
        <section class="mb-[40px]">
          <h1 class="text-[38px] font-bold mb-3 leading-tight">리뷰어들은 이 질문에<br>어떻게 답변했을까요?</h1>
          <p class="text-[16px] text-[#666666]">키워드를 입력하여 수천 개의 PR 속에 담긴 리뷰어의 인사이트를 찾아보세요.</p>
        </section>

        <section class="grid grid-cols-2 gap-10 mb-[40px]">
          <div>
            <h3 class="text-[13px] font-bold text-[#999999] uppercase tracking-wider mb-3">분야 선택</h3>
            <div id="field-buttons" class="flex gap-2"></div>
          </div>
          <div>
            <h3 class="text-[13px] font-bold text-[#999999] uppercase tracking-wider mb-3">질문할 미션 선택</h3>
            <div id="mission-buttons" class="flex gap-2 flex-wrap"></div>
          </div>
        </section>

        <section class="mb-[48px]">
          <div class="flex gap-3 w-full">
            <div class="relative flex-1">
              <i class="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-[#999999] text-lg"></i>
              <input
                id="search-input"
                type="text"
                placeholder="궁금한 키워드를 입력하세요 (예: 예외 처리, 트랜잭션, 컴포넌트 분리)"
                class="w-full h-[64px] bg-[#F5F5F7] rounded-2xl pl-[52px] pr-5 text-[16px] focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              >
            </div>
            <button
              id="search-btn"
              disabled
              class="h-[64px] px-8 rounded-2xl bg-black text-white font-semibold text-[16px] transition-all hover:bg-[#222] disabled:bg-[#CCCCCC] disabled:cursor-not-allowed whitespace-nowrap"
            >
              탐색
            </button>
          </div>
        </section>

        <section id="results-section">
          <div class="flex items-center justify-between mb-6">
            <h2 id="results-title" class="text-[22px] font-bold"></h2>
            <div id="sort-bar" class="hidden flex items-center gap-2 text-[13px] text-[#666666]">
              <span class="font-medium text-black">최신순</span>
              <span class="text-[#EEEEEE]">|</span>
              <span>정확도순</span>
            </div>
          </div>
          <div id="results-grid" class="grid grid-cols-1 gap-5"></div>
          <div class="mt-8 flex justify-center">
            <button
              id="load-more-btn"
              class="px-8 py-3 border border-[#EEEEEE] rounded-2xl font-semibold text-[#666666] hover:bg-[#F5F5F7] transition-all hidden"
            >
              결과 더보기
            </button>
          </div>
        </section>
      </main>

      <footer class="mt-[80px] border-t border-[#EEEEEE] px-[40px] py-[48px] bg-white">
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Reveiwoowacourse 로고" class="w-7 h-7 object-contain">
              <span class="text-base font-bold">Reveiwoowacourse</span>
            </div>
            <p class="text-[#999999] text-[13px]">© 2026 Reveiwoowacourse. 모든 리뷰 데이터는 공개된 GitHub PR을 기반으로 합니다.</p>
          </div>
          <div class="flex gap-12">
            <div>
              <h4 class="font-bold mb-3 text-[15px]">서비스</h4>
              <ul class="text-[#666666] text-[13px] space-y-2">
                <li><a href="#" class="hover:text-[#1A1A1A] transition-colors">미션 목록</a></li>
                <li><a href="#" class="hover:text-[#1A1A1A] transition-colors">리뷰어 랭킹</a></li>
                <li><a href="#" class="hover:text-[#1A1A1A] transition-colors">인사이트 리포트</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold mb-3 text-[15px]">고객지원</h4>
              <ul class="text-[#666666] text-[13px] space-y-2">
                <li><a href="#" class="hover:text-[#1A1A1A] transition-colors">이용안내</a></li>
                <li><a href="#" class="hover:text-[#1A1A1A] transition-colors">문의하기</a></li>
                <li><a href="#" class="hover:text-[#1A1A1A] transition-colors">개인정보처리방침</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `;
}

// ─── 필터 버튼 ───────────────────────────────────────────────────────────────

function buildFieldButtons() {
  return state.tracks
    .map(({ track }) => {
      const active = state.track === track;
      return `<button
        data-track="${track}"
        class="field-btn px-6 py-3 rounded-xl font-semibold text-[15px] transition-all ${
          active
            ? 'bg-black text-white'
            : 'bg-white border border-[#EEEEEE] text-[#666666] hover:bg-[#F5F5F7]'
        }"
      >${trackLabel(track)}</button>`;
    })
    .join('');
}

function buildMissionButtons() {
  return state.missions
    .map(({ name }) => {
      const active = state.mission === name;
      return `<button
        data-mission="${name}"
        class="mission-btn px-5 py-3 rounded-xl font-semibold text-[15px] flex items-center gap-2 transition-all ${
          active
            ? 'bg-[#F5F5F7] border border-transparent text-[#1A1A1A]'
            : 'bg-white border border-[#EEEEEE] text-[#666666] hover:bg-[#F5F5F7]'
        }"
      >
        <i class="fa-solid ${missionIcon(name)} text-[13px]"></i>
        ${missionDisplayName(name)}
      </button>`;
    })
    .join('');
}

function refreshFilterButtons() {
  const fieldEl = document.getElementById('field-buttons');
  const missionEl = document.getElementById('mission-buttons');
  if (fieldEl) fieldEl.innerHTML = buildFieldButtons();
  if (missionEl) missionEl.innerHTML = buildMissionButtons();
  updateSearchButton();
}

function updateSearchButton() {
  const btn = document.getElementById('search-btn');
  if (btn) btn.disabled = !state.mission;
}

function triggerSearch() {
  if (!state.mission) return;
  const input = document.getElementById('search-input');
  state.search = input?.value.trim() ?? '';
  state.results = null;
  performSearch();
}

// ─── 검색 ────────────────────────────────────────────────────────────────────

let searchAbortController = null;

async function performSearch() {
  if (!state.mission) return;
  if (!state.search) {
    state.results = null;
    state.error = null;
    state.loading = false;
    state.displayCount = PAGE_SIZE;
    renderResults();
    return;
  }

  if (searchAbortController) searchAbortController.abort();
  searchAbortController = new AbortController();

  shuffleFacts();
  state.loading = true;
  state.error = null;
  state.displayCount = PAGE_SIZE;
  renderResults();
  startFactTimer();

  try {
    const results = await searchReviews({
      query: state.search,
      track: state.track,
      mission: state.mission,
      limit: 20,
    });
    state.results = results;
    state.loading = false;
    clearFactTimer();
    renderResults();
  } catch (e) {
    if (e.name === 'AbortError') return;
    state.loading = false;
    clearFactTimer();
    state.error = e.message;
    renderResults();
  }
}

// ─── 렌더링 ─────────────────────────────────────────────────────────────────

function renderResults() {
  const titleEl = document.getElementById('results-title');
  const sortBar = document.getElementById('sort-bar');
  const gridEl = document.getElementById('results-grid');
  const loadMoreBtn = document.getElementById('load-more-btn');

  // 검색어 없음 — 초기 안내 화면
  if (!state.search) {
    titleEl.innerHTML = '';
    sortBar.classList.add('hidden');
    gridEl.innerHTML = `
      <div class="py-16 text-center">
        <i class="fa-solid fa-magnifying-glass text-4xl text-[#CCCCCC] mb-4 block"></i>
        <p class="text-[16px] text-[#999999]">궁금한 키워드를 검색해 리뷰어의 인사이트를 확인해보세요.</p>
      </div>
    `;
    loadMoreBtn.classList.add('hidden');
    return;
  }

  // 로딩 중
  if (state.loading) {
    titleEl.innerHTML = `'${state.search}'에 대한 리뷰어의 답변`;
    sortBar.classList.add('hidden');
    gridEl.innerHTML = `
      <div class="py-16 text-center">
        <div class="w-9 h-9 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-[16px] text-[#999999]">리뷰어의 인사이트를 불러오는 중...</p>
        <div class="mt-8 max-w-[600px] mx-auto bg-[#F8F9FA] rounded-2xl px-5 py-4">
          <div class="flex items-center gap-3">
            <button id="fact-prev" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E8E8E8] transition-all shrink-0 text-[#AAAAAA] hover:text-[#444444]">
              <i class="fa-solid fa-chevron-left text-sm"></i>
            </button>
            <p id="loading-fact" class="flex-1 text-[13px] text-[#666666] leading-relaxed">${currentFact()}</p>
            <button id="fact-next" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E8E8E8] transition-all shrink-0 text-[#AAAAAA] hover:text-[#444444]">
              <i class="fa-solid fa-chevron-right text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    loadMoreBtn.classList.add('hidden');
    return;
  }

  // API 오류
  if (state.error) {
    titleEl.innerHTML = `'${state.search}'에 대한 리뷰어의 답변`;
    sortBar.classList.add('hidden');
    gridEl.innerHTML = `
      <div class="py-16 text-center">
        <i class="fa-solid fa-triangle-exclamation text-4xl text-[#CCCCCC] mb-4 block"></i>
        <p class="text-[16px] text-[#999999]">검색 중 오류가 발생했습니다.</p>
        <p class="text-[13px] text-[#CCCCCC] mt-2">${state.error}</p>
      </div>
    `;
    loadMoreBtn.classList.add('hidden');
    return;
  }

  if (!state.results) return;

  const { items } = state.results;
  const visible = items.slice(0, state.displayCount);

  titleEl.innerHTML = `'${state.search}'에 대한 리뷰어의 답변 <span class="text-[#999999] ml-2">${items.length}</span>`;
  sortBar.classList.remove('hidden');

  if (visible.length === 0) {
    gridEl.innerHTML = `
      <div class="py-16 text-center">
        <i class="fa-regular fa-comment-dots text-4xl text-[#CCCCCC] mb-4 block"></i>
        <p class="text-[16px] text-[#999999]">해당 조건에 맞는 리뷰 데이터가 없습니다.</p>
      </div>
    `;
  } else {
    gridEl.innerHTML = visible.map(buildCard).join('');
  }

  loadMoreBtn.classList.toggle('hidden', items.length <= state.displayCount);
}

function buildCard(group) {
  const { groupTitle, representativeAnswer, count, documents = [], reviewerSections = [] } = group;

  // reviewerSections에서 리뷰어 정보 추출 (최대 3명), 없으면 documents 폴백
  const sections = reviewerSections.slice(0, 3);
  const hasMore = reviewerSections.length > 3;
  const avatars = sections
    .map((s) => `<img src="https://github.com/${s.reviewer}.png?size=96" class="w-10 h-10 rounded-full border-2 border-white ring-1 ring-gray-100" alt="${s.nickname ?? s.reviewer}">`)
    .join('');

  const nameList = sections.length > 0
    ? sections.map((s) => `'${s.nickname ?? reviewerNickname(s.reviewer)}'`).join(', ') + (hasMore ? ', ...' : '')
    : '';
  const githubUrl = documents[0]?.githubUrl ?? '#';
  const missionSlug = documents[0]?.mission ?? '';
  const missionName = missionSlug ? missionDisplayName(missionSlug) : '전체';
  const html = marked.parse(representativeAnswer ?? '');
  const content = highlightKeyword(html, state.search);

  const lastName = sections.length > 0
    ? (sections[sections.length - 1].nickname ?? reviewerNickname(sections[sections.length - 1].reviewer))
    : '';
  const particle = hasMore ? '는' : eunNeun(lastName);

  const reviewerLine = nameList
    ? `이 질문에 대해 <span class="font-bold">${nameList}</span>${particle} 이렇게 말했어요`
    : '이 질문에 대한 리뷰어 답변';

  const defaultAvatar = !avatars
    ? `<div class="w-10 h-10 rounded-full border-2 border-white ring-1 ring-gray-100 bg-[#EEEEEE] flex items-center justify-center">
         <i class="fa-solid fa-users text-[#999999] text-sm"></i>
       </div>`
    : '';

  // 카드 하단 리뷰어 목록 — reviewerSections 전체 표시
  const reviewerFooter = reviewerSections.length > 0
    ? `<div class="mt-4 pt-4 border-t border-[#EEEEEE] flex flex-col gap-1">
        ${reviewerSections.map((s) => {
          const name = s.nickname ?? reviewerNickname(s.reviewer);
          return s.comments.map((c, i) => `
            <div class="flex items-center justify-between py-1.5">
              <div class="flex items-center gap-2">
                <img src="https://github.com/${s.reviewer}.png?size=96"
                     class="w-7 h-7 rounded-full shrink-0" alt="${name}">
                <span class="text-[13px] font-semibold text-[#1A1A1A]">${name}</span>
                ${s.comments.length > 1
                  ? `<span class="text-[11px] text-[#999999]">${i + 1}번째 답변</span>`
                  : ''}
                ${c.prTitle
                  ? `<span class="text-[12px] text-[#AAAAAA] truncate max-w-[200px]">${c.prTitle}</span>`
                  : ''}
              </div>
              <a href="${c.githubUrl}" target="_blank" rel="noopener noreferrer"
                 class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F5F7] text-[12px] font-semibold text-[#555555] hover:bg-black hover:text-white transition-all whitespace-nowrap shrink-0">
                <i class="fa-brands fa-github"></i>
                GitHub PR 보기
              </a>
            </div>
          `).join('');
        }).join('')}
      </div>`
    : '';

  return `
    <div class="group p-6 bg-white border border-[#EEEEEE] rounded-[20px] hover:border-black hover:shadow-xl transition-all duration-300">
      <div class="flex items-start justify-between mb-5">
        <div class="flex items-center gap-3">
          <div class="flex -space-x-2">
            ${avatars || defaultAvatar}
          </div>
          <div>
            <p class="text-[15px] text-[#1A1A1A]">${reviewerLine}</p>
            <p class="text-[13px] text-[#999999] mt-0.5">비슷한 답변 ${count}건 • ${missionName} 미션</p>
          </div>
        </div>
        ${groupTitle ? `<span class="text-[15px] font-semibold text-[#444444] bg-[#F5F5F7] px-3 py-1.5 rounded-lg shrink-0 ml-4">${groupTitle}</span>` : ''}
      </div>
      <div class="bg-[#F8F9FA] p-5 rounded-2xl">
        <div class="prose prose-sm max-w-none prose-p:text-[#333333] prose-headings:text-[#1A1A1A] prose-code:text-[#1A1A1A] prose-pre:bg-[#EEEEEE]">
          ${content}
        </div>
      </div>
      ${reviewerFooter}
    </div>
  `;
}

// 끝 글자 받침 여부로 '는'/'은' 자동 선택
function eunNeun(word) {
  if (!word) return '은';
  const code = word.charCodeAt(word.length - 1);
  if (code >= 0xAC00 && code <= 0xD7A3) {
    return (code - 0xAC00) % 28 === 0 ? '는' : '은';
  }
  return '는'; // 영문·숫자 등 비한글은 '는' 기본
}

function highlightKeyword(html, keyword) {
  if (!keyword || !html) return html ?? '';
  const safePattern = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safePattern})`, 'gi');
  // HTML 태그(<...>)는 그대로 두고, 텍스트 노드에만 하이라이팅 적용
  return html.replace(/(<[^>]*>)|([^<]+)/g, (_, tag, text) =>
    tag ? tag : text.replace(regex, '<mark class="bg-yellow-100 font-medium rounded px-0.5">$1</mark>'),
  );
}

// ─── 이벤트 바인딩 ───────────────────────────────────────────────────────────

function attachEventListeners() {
  const app = document.getElementById('app');

  app.addEventListener('click', async (e) => {
    if (e.target.closest('#fact-prev')) { prevFact(); return; }
    if (e.target.closest('#fact-next')) { nextFact(); return; }

    if (e.target.closest('#search-btn')) {
      triggerSearch();
      return;
    }

    const trackBtn = e.target.closest('[data-track]');
    if (trackBtn) {
      const newTrack = trackBtn.dataset.track;
      if (state.track !== newTrack) {
        state.track = newTrack;
        state.mission = null;
        state.results = null;
        state.displayCount = PAGE_SIZE;
        refreshFilterButtons();
        renderResults();
        await loadMissions();
      }
      return;
    }

    const missionBtn = e.target.closest('[data-mission]');
    if (missionBtn) {
      const clicked = missionBtn.dataset.mission;
      state.mission = state.mission === clicked ? null : clicked;
      state.results = null;
      state.displayCount = PAGE_SIZE;
      refreshFilterButtons();
      renderResults();
      return;
    }

    if (e.target.closest('#load-more-btn')) {
      state.displayCount += PAGE_SIZE;
      renderResults();
    }
  });

  app.addEventListener('keydown', (e) => {
    if (e.target.id === 'search-input' && e.key === 'Enter') {
      triggerSearch();
    }
  });
}

init();
