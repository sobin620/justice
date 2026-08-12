/* 상단 01~06 버튼을 눌렀을 때 이동할 화 번호 */
const navigationTargets = [1, 25, 50, 100, 200, 300];

/* 특정 화에만 다른 제목·설명·카드 모양을 적용하는 데이터 */
const specialEpisodes = {
  3: {
    title: "공소시효",
    description: "특정 사건에 가담하여 형벌을 처리하려 할 때\n설명 내용"
  },
  15: {
    title: "검찰 배치도",
    type: "prosecutor" // 검찰 배치도 전용 카드 모양 사용
  },
  357: {
    title: "검사 수사관 실무관",
    type: "staff" // 직책 전용 카드 모양 사용
  }
};

/* 1화부터 386화까지 에피소드 데이터를 자동으로 생성 */
const episodes = Array.from({ length: 386 }, (_, index) => {
  const episode = index + 1;

  /* specialEpisodes에 같은 화 번호가 있으면 기본값을 덮어씀 */
  return {
    episode,
    title: "법률 용어",
    description: "설명",
    type: "term",
    ...specialEpisodes[episode]
  };
});

/* HTML에서 버튼을 넣을 영역과 에피소드를 넣을 영역 선택 */
const navigation = document.querySelector("#navigation");
const episodeContainer = document.querySelector("#episodes");

/* 현재 선택된 버튼, 스크롤 이동 중인지 저장 */
let activeTarget = 1;
let isNavigating = false;
let navigationTimer;

/* 새로고침해도 이전 스크롤 위치로 돌아가지 않게 설정 */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

/* 선택한 화 번호에 맞게 버튼 색상을 변경 */
function setActive(target) {
  activeTarget = target;

  document.querySelectorAll(".nav-button").forEach((button) => {
    const isCurrent = Number(button.dataset.target) === target;

    /* true인 버튼만 빨간 배경 / 흰 글자 */
    button.setAttribute("aria-current", String(isCurrent));
  });
}

/* 특정 화 위치로 부드럽게 스크롤 */
function scrollToEpisode(target) {
  setActive(target); // 누른 버튼을 바로 선택 상태로 변경
  isNavigating = true; // 스크롤 중 자동 색상 변경 방지

  window.clearTimeout(navigationTimer);

  /* 예: target이 25면 id="episode-25" 위치로 이동 */
  document
    .querySelector(`#episode-${target}`)
    .scrollIntoView({ behavior: "smooth", block: "start" });

  /* 약 0.9초 뒤 일반 스크롤 감지를 다시 허용 */
  navigationTimer = window.setTimeout(() => {
    isNavigating = false;
  }, 900);
}

/* navigationTargets를 이용해 01~06 원형 버튼 생성 */
navigationTargets.forEach((target, index) => {
  const button = document.createElement("button");

  button.className = "nav-button";
  button.type = "button";
  button.dataset.target = target;

  /* index 0 → 01, index 1 → 02 */
  button.textContent = String(index + 1).padStart(2, "0");

  button.setAttribute("aria-label", `${target}화로 이동`);
  button.setAttribute("aria-current", String(target === 1));

  /* 버튼 클릭 시 지정된 화로 이동 */
  button.addEventListener("click", () => scrollToEpisode(target));

  navigation.append(button);
});

/* 에피소드 데이터에 따라 카드 HTML 모양을 결정 */
function cardMarkup(item) {
  /* 검찰 배치도 전용 카드 */
  if (item.type === "prosecutor") {
    return `<article class="episode-card large">
      <h2 class="episode-title">${item.title}</h2>
      <div class="prosecutor-layout">
        <div>서울중앙지검</div>
        <div>형사부<br>강력부</div>
        <div class="chiefs">
          <span>1차장</span><span>2차장</span>
          <span>3차장</span><span>4차장</span>
        </div>
      </div>
    </article>`;
  }

  /* 검사·수사관·실무관 전용 카드 */
  if (item.type === "staff") {
    return `<article class="episode-card large">
      <h2 class="episode-title">${item.title}</h2>
      <div class="staff-layout">
        <p>형사부</p>
        <p>강력부 1팀<br>강력부 1팀</p>
        <p>형사팀과장</p>
        <p>검사<br>수사관<br>실무관</p>
      </div>
    </article>`;
  }

  /* 기본 카드: 제목 + 설명 */
  return `<article class="episode-card">
    <h2 class="episode-title">${item.title}</h2>
    <p class="episode-description">${item.description}</p>
  </article>`;
}

/* 1~386화 section을 실제 HTML 화면에 생성 */
episodeContainer.innerHTML = episodes
  .map((item) => `
    <section
      id="episode-${item.episode}"
      class="episode"
      aria-labelledby="episode-title-${item.episode}"
    >
      <div class="episode-number">${item.episode}화</div>
      ${cardMarkup(item).replace(
        'class="episode-title"',
        `id="episode-title-${item.episode}" class="episode-title"`
      )}
    </section>
  `)
  .join("");

/* 바로가기 버튼이 연결한 화들만 스크롤 감지 대상으로 지정 */
const observed = navigationTargets.map((target) =>
  document.querySelector(`#episode-${target}`)
);

/* 사용자가 직접 스크롤할 때 현재 위치의 버튼 색상을 자동 변경 */
const observer = new IntersectionObserver(
  (entries) => {
    if (isNavigating) return; // 버튼 클릭 이동 중이면 색상 변경 금지

    const current = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (current) {
      const episodeNumber = Number(
        current.target.id.replace("episode-", "")
      );

      setActive(episodeNumber);
    }
  },
  {
    rootMargin: "-220px 0px -65% 0px", // 고정 헤더 높이를 고려
    threshold: [0, 0.1, 0.5]
  }
);

/* 각 대상 화를 스크롤 감지 시작 */
observed.forEach((element) => observer.observe(element));

/* 새로고침하면 항상 맨 위 + 01 버튼 선택 상태 */
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  setActive(1);
});

/* PC에서 버튼 영역 위 휠을 굴리면 버튼을 가로 스크롤 */
navigation.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      navigation.parentElement.scrollLeft += event.deltaY;
    }
  },
  { passive: false }
);

const pageHeader = document.querySelector("#page-header");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  /* 아래로 내릴 때 → 헤더 보이기 */
  if (currentScrollY <= 0 || currentScrollY < lastScrollY) {
    pageHeader.classList.remove("is-hidden");
  }

  /* 위로 올릴 때 → 헤더 숨기기 */
  else if (currentScrollY > lastScrollY) {
    pageHeader.classList.add("is-hidden");
  }

  lastScrollY = currentScrollY;
}, { passive: true });