import './style.css';
import { marked } from 'marked';
import { searchReviews, getTracks, getMissions } from './api.js';
import { trackLabel, missionDisplayName, missionIcon, FALLBACK_TRACKS, reviewerNickname } from './data.js';

marked.use({ gfm: true, breaks: true });

const PAGE_SIZE = 5;

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
          <div class="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
            <i class="fa-solid fa-code-pull-request text-white text-lg"></i>
          </div>
          <span class="text-lg font-bold tracking-tight">PR Insight</span>
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
              <div class="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
                <i class="fa-solid fa-code-pull-request text-white text-xs"></i>
              </div>
              <span class="text-base font-bold">PR Insight</span>
            </div>
            <p class="text-[#999999] text-[13px]">© 2026 PR Insight. 모든 리뷰 데이터는 공개된 GitHub PR을 기반으로 합니다.</p>
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

  state.loading = true;
  state.error = null;
  state.displayCount = PAGE_SIZE;
  renderResults();

  try {
    const results = await searchReviews({
      query: state.search,
      track: state.track,
      mission: state.mission,
      limit: 5,
    });
    state.results = results;
    state.loading = false;
    renderResults();
  } catch (e) {
    if (e.name === 'AbortError') return;
    state.loading = false;
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
  const avatars = sections
    .map((s) => `<img src="https://github.com/${s.reviewer}.png?size=96" class="w-10 h-10 rounded-full border-2 border-white ring-1 ring-gray-100" alt="${s.nickname ?? s.reviewer}">`)
    .join('');

  const nameList = sections
    .map((s) => `'${s.nickname ?? reviewerNickname(s.reviewer)}'`)
    .join(', ');
  const githubUrl = documents[0]?.githubUrl ?? '#';
  const missionSlug = documents[0]?.mission ?? '';
  const missionName = missionSlug ? missionDisplayName(missionSlug) : '전체';
  const html = marked.parse(representativeAnswer ?? '');
  const content = highlightKeyword(html, state.search);

  const reviewerLine = nameList
    ? `이 질문에 대해 <span class="font-bold">${nameList}</span>님은 다음처럼 대답했어요`
    : '이 질문에 대한 리뷰어 답변';

  const defaultAvatar = !avatars
    ? `<div class="w-10 h-10 rounded-full border-2 border-white ring-1 ring-gray-100 bg-[#EEEEEE] flex items-center justify-center">
         <i class="fa-solid fa-users text-[#999999] text-sm"></i>
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
        <a
          href="${githubUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F5F7] text-[13px] font-semibold group-hover:bg-black group-hover:text-white transition-all whitespace-nowrap shrink-0"
        >
          <i class="fa-brands fa-github"></i>
          GitHub PR 보기
        </a>
      </div>
      ${groupTitle ? `<p class="text-[14px] font-semibold text-[#1A1A1A] mb-3">${groupTitle}</p>` : ''}
      <div class="bg-[#F8F9FA] p-5 rounded-2xl">
        <div class="prose prose-sm max-w-none prose-p:text-[#333333] prose-headings:text-[#1A1A1A] prose-code:text-[#1A1A1A] prose-pre:bg-[#EEEEEE]">
          ${content}
        </div>
      </div>
    </div>
  `;
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
