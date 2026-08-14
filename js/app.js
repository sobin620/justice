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

/* 현재 선택된 버튼, 스크롤 이동 중인지 저장 */
let activeTarget = 1;
let isNavigating = false;
let navigationTimer;

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
  /* 선택한 번호 활성화 */
  setActive(target);

  /*
    번호 버튼을 클릭하면
    이동 방향과 관계없이 헤더를 먼저 보여줌
  */
  pageHeader.classList.remove("is-hidden");

  /*
    중요:
    번호 버튼으로 이동하는 동안에는
    일반 스크롤에 의한 헤더 숨김/표시를 막음
  */
  isNavigating = true;

  /* 기존 타이머 제거 */
  window.clearTimeout(navigationTimer);

  /* 해당 화로 이동 */
  const targetElement = document.querySelector(`#episode-${target}`);

  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }


//   navigationTimer = window.setTimeout(() => {
//     isNavigating = false;


//     lastScrollY = window.scrollY;

//     pageHeader.classList.remove("is-hidden");
//   }, 1200);
// }

/* 스크롤 이동이 완료되는 순간 바로 딜레이 없이 제어권 해제 */
  const onScrollEnd = () => {
    isNavigating = false;
    lastScrollY = window.scrollY;
    window.removeEventListener("scrollend", onScrollEnd);
  };

  window.addEventListener("scrollend", onScrollEnd);

  /* 혹시 모를 구형 브라우저 대응용 타임아웃 (300ms로 대폭 축소) */
  window.clearTimeout(navigationTimer);
  navigationTimer = window.setTimeout(() => {
    isNavigating = false;
    lastScrollY = window.scrollY;
  }, 300);
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
  button.addEventListener("click", () => {
    scrollToEpisode(target);
  });

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
    /* 번호 버튼 클릭 이동 중이면 자동 변경하지 않음 */
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

/* 각 대상 화를 스크롤 감지 시작 */
observed.forEach((element) => observer.observe(element));

/* 새로고침하면 항상 맨 위 + 01 버튼 선택 상태 */
window.addEventListener("load", () => {
  window.scrollTo(0, 0);

  pageHeader.classList.remove("is-hidden");

  lastScrollY = 0;

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

/*
  헤더 숨김 / 표시
*/
window.addEventListener(
  "scroll",
  () => {
    const currentScrollY = window.scrollY;

    /*
      ★ 핵심 ★

      번호 버튼을 눌러서 이동하는 중이면
      여기서 헤더를 숨기지 않음.

      smooth 스크롤 때문에 scroll 이벤트가 여러 번 발생해도
      헤더가 계속 보이는 상태로 유지됨.
    */
    if (isNavigating) {
      pageHeader.classList.remove("is-hidden");
      lastScrollY = currentScrollY;
      return;
    }

    const scrollDifference = Math.abs(
      currentScrollY - lastScrollY
    );

    /* 맨 위로 왔을 땐 무조건 보이기 */
    if (currentScrollY <= 0) {
      pageHeader.classList.remove("is-hidden");
      lastScrollY = currentScrollY;
      return;
    }

    /* 10px보다 작은 움직임은 무시 */
    if (scrollDifference < THRESHOLD) {
      lastScrollY = currentScrollY; // ★ 이 줄을 추가해 주면 해결됩니다!
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