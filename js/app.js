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
    type: "prosecutor"
  },
  357: {
    title: "검사 수사관 실무관",
    type: "staff"
  }
};

/* 1화부터 386화까지 에피소드 데이터를 자동으로 생성 */
const episodes = Array.from({ length: 386 }, (_, index) => {
  const episode = index + 1;

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

/* 현재 선택된 버튼 및 유저 입력 상태 저장 */
let activeTarget = 1;
let isNavigating = false;
let isUserInteraction = false;

/* 유저가 직접 휠/터치/키보드로 스크롤했는지 감지 */
window.addEventListener("wheel", () => { isUserInteraction = true; }, { passive: true });
window.addEventListener("touchmove", () => { isUserInteraction = true; }, { passive: true });
window.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Space"].includes(e.code)) {
    isUserInteraction = true;
  }
}, { passive: true });

/* 헤더 */
const pageHeader = document.querySelector("#page-header");
let lastScrollY = window.scrollY;
const THRESHOLD = 10;

/* 새로고침해도 이전 스크롤 위치로 돌아가지 않게 설정 */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

/* 선택한 화 번호에 맞게 버튼 색상을 변경 */
function setActive(target) {
  activeTarget = target;

  document.querySelectorAll(".nav-button").forEach((button) => {
    const isCurrent = Number(button.dataset.target) === target;
    button.setAttribute("aria-current", String(isCurrent));
  });
}

/* 특정 화 위치로 부드럽게 스크롤 */
function scrollToEpisode(target) {
  /* 1. 눌른 버튼 번호 즉시 활성화 */
  setActive(target);

  /* 2. 헤더 노출 및 버튼 이동 플래그 설정 */
  pageHeader.classList.remove("is-hidden");
  isNavigating = true;
  isUserInteraction = false;

  /* 3. 해당 위치로 스크롤 이동 */
  const targetElement = document.querySelector(`#episode-${target}`);

  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  lastScrollY = window.scrollY;
}

/* navigationTargets를 이용해 01~06 원형 버튼 생성 */
navigationTargets.forEach((target, index) => {
  const button = document.createElement("button");

  button.className = "nav-button";
  button.type = "button";
  button.dataset.target = target;

  button.textContent = String(index + 1).padStart(2, "0");

  button.setAttribute("aria-label", `${target}화로 이동`);
  button.setAttribute("aria-current", String(target === 1));

  button.addEventListener("click", () => {
    scrollToEpisode(target);
  });

  navigation.append(button);
});

/* 에피소드 데이터에 따라 카드 HTML 모양을 결정 */
function cardMarkup(item) {
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
    if (isNavigating) return;

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
    rootMargin: "-220px 0px -65% 0px",
    threshold: [0, 0.1, 0.5]
  }
);

observed.forEach((element) => observer.observe(element));

/* 새로고침시 상단 초기화 */
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  pageHeader.classList.remove("is-hidden");
  lastScrollY = 0;
  setActive(1);
});

/* PC 가로 스크롤 */
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

/* 헤더 숨김 / 표시 스크롤 제어 */
window.addEventListener(
  "scroll",
  () => {
    const currentScrollY = window.scrollY;

    /* 번호 이동 중 처리 */
    if (isNavigating) {
      pageHeader.classList.remove("is-hidden");

      /* 유저가 손으로 스크롤을 조작했을 때만 내비게이션 모드 해제 */
      if (isUserInteraction) {
        isNavigating = false;
        if (currentScrollY > lastScrollY) {
          pageHeader.classList.add("is-hidden");
        }
      }
      lastScrollY = currentScrollY;
      return;
    }

    const scrollDifference = Math.abs(currentScrollY - lastScrollY);

    /* 맨 위로 왔을 때 */
    if (currentScrollY <= 0) {
      pageHeader.classList.remove("is-hidden");
      lastScrollY = currentScrollY;
      return;
    }

    /* 10px 미만 움직임 감지 시 기준점만 업데이트 */
    if (scrollDifference < THRESHOLD) {
      lastScrollY = currentScrollY;
      return;
    }

    /* 아래로 내릴 때 → 헤더 숨김 */
    if (currentScrollY > lastScrollY) {
      pageHeader.classList.add("is-hidden");
    }
    /* 위로 올릴 때 → 헤더 보임 */
    else {
      pageHeader.classList.remove("is-hidden");
    }

    lastScrollY = currentScrollY;
  },
  { passive: true }
);