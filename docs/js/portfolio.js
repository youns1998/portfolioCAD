(function () {
  "use strict";

  const projects = Array.isArray(window.portfolioProjects) ? window.portfolioProjects : [];
  const page = document.body.dataset.page;
  const asset = (path) => (page === "detail" ? "../" : "") + path;
  const detailUrl = (project, documentId) => {
    const params = new URLSearchParams({ project: project.id });
    if (documentId) params.set("document", documentId);
    return asset("projects/detail.html") + "?" + params;
  };
  const node = (tag, className, content) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  };
  const append = (parent, ...children) => {
    children.filter(Boolean).forEach((child) => parent.append(child));
    return parent;
  };
  const link = (label, href, className, external = false) => {
    const anchor = node("a", className, label);
    anchor.href = href;
    if (external) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    return anchor;
  };
  const line = (parent, label, value) => {
    if (!value) return;
    const row = node("div");
    append(row, node("dt", "", label), node("dd", "", value));
    parent.append(row);
  };

  function createVideoStage(media, fallbackPoster) {
    const stage = node("div", "isometric-stage");
    const video = node("video", "isometric-video");
    video.src = asset(media.file);
    video.preload = "metadata";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("aria-label", media.title);
    if (media.poster || fallbackPoster) video.poster = asset(media.poster || fallbackPoster);
    const toggle = node("button", "video-toggle", "회전 재생");
    toggle.type = "button";
    toggle.setAttribute("aria-pressed", "false");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncPlayback = () => {
      toggle.textContent = video.paused ? "회전 재생" : "회전 일시 정지";
      toggle.setAttribute("aria-pressed", String(!video.paused));
    };
    const pause = () => { video.pause(); syncPlayback(); };
    const play = () => {
      video.playbackRate = media.playbackRate || 0.5;
      video.play().catch(() => { syncPlayback(); });
    };
    stage.addEventListener("pointerenter", () => { if (hoverPointer.matches && !reducedMotion.matches) play(); });
    stage.addEventListener("pointerleave", pause);
    toggle.addEventListener("click", () => { if (video.paused) play(); else pause(); });
    video.addEventListener("play", syncPlayback);
    video.addEventListener("pause", syncPlayback);
    video.addEventListener("error", () => { pause(); toggle.disabled = true; toggle.textContent = "영상을 불러올 수 없습니다."; });
    reducedMotion.addEventListener?.("change", () => { if (reducedMotion.matches) pause(); });
    document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => { if (!entries[0].isIntersecting) pause(); });
      observer.observe(stage);
    }
    append(stage, video, toggle);
    return stage;
  }

  function renderHome() {
    const drawings = document.getElementById("drawing-project-list");
    const repositories = document.getElementById("github-project-list");
    if (!drawings || !repositories) return;
    drawings.replaceChildren();
    repositories.replaceChildren();
    projects.forEach((project) => {
      const isCode = Boolean(project.url) && !project.documents.length;
      const list = isCode ? repositories : drawings;
      const article = node("article", "project-card " + (isCode ? "project-card--code" : "project-card--drawing"));
      article.dataset.project = project.id;
      const figure = !isCode && !project.video?.file
        ? link("", detailUrl(project), "project-card-visual drawing-thumbnail-link")
        : node("div", "project-card-visual");
      if (figure.tagName === "A") figure.setAttribute("aria-label", project.title + " 도면·자료 보기");
      const documents = project.documents.filter((item) => item.file);
      const thumbnail = project.thumbnail || documents.find((item) => item.thumbnail)?.thumbnail;
      if (project.video?.file) {
        figure.append(createVideoStage(project.video, thumbnail));
      } else if (thumbnail) {
        const image = node("img");
        image.src = asset(thumbnail);
        image.alt = project.thumbnailAlt || project.title + " 도면 미리보기";
        image.loading = "lazy";
        figure.append(image);
        const caption = node("span", "visual-caption", isCode ? project.visual?.caption || project.category : project.thumbnailEffect === "isometric" ? "ISOMETRIC VIEW" : "ARCHITECTURAL DRAWINGS");
        caption.setAttribute("aria-hidden", "true");
        figure.append(caption);
        if (project.thumbnailEffect === "isometric") {
          figure.classList.add("isometric-preview");
        }
      } else {
        const illustration = node("div", "tool-preview");
        illustration.setAttribute("aria-hidden", "true");
        append(illustration, node("p", "tool-preview-caption", project.visual?.caption || project.category), node("strong", "tool-preview-title", project.visual?.title || project.title));
        (project.visual?.items || []).forEach((label, toolIndex) => {
          const row = node("div", "tool-preview-row");
          append(row, node("span", "", String(toolIndex + 1).padStart(2, "0")), node("strong", "", label), node("span", "tool-preview-indicator", "↗"));
          illustration.append(row);
        });
        append(figure, node("span", "visual-grid"), illustration);
      }
      figure.append(node("span", "visual-number", String(list.childElementCount + 1).padStart(2, "0")));
      const copy = node("div", "project-card-copy");
      append(copy, node("p", "eyebrow", project.category), node("h4", "project-card-title", project.title), node("p", "project-card-description", project.description));
      const tools = node("ul", "project-tools");
      tools.setAttribute("aria-label", "사용 도구");
      (project.tools || []).forEach((tool) => tools.append(node("li", "", tool)));
      copy.append(tools);
      const actions = node("div", "project-actions");
      const meta = node("dl", "project-card-meta");
      line(meta, "기간", project.duration);
      line(meta, "결과물", documents.length
        ? "PDF " + documents.length + "개 · 총 " + documents.reduce((sum, item) => sum + (item.pages || 0), 0) + "쪽"
        : "GitHub 저장소");
      copy.append(meta);
      const open = link("", isCode ? project.readmeUrl || project.url + "#readme" : detailUrl(project), "project-open-link" + (isCode ? " repository-link" : ""), isCode);
      open.setAttribute("aria-label", project.title + (isCode ? " GitHub README 보기 (새 창)" : " 도면·자료 보기"));
      append(open, node("span", "", isCode ? "GitHub README 보기" : "도면·자료 보기"), node("span", "project-open-arrow", "↗"));
      actions.append(open);
      copy.append(actions);
      append(article, figure, copy);
      list.append(article);
    });
    document.getElementById("drawing-project-count").textContent = String(drawings.childElementCount).padStart(2, "0") + " PROJECTS";
    document.getElementById("github-project-count").textContent = String(repositories.childElementCount).padStart(2, "0") + " REPOSITORIES";
  }

  function renderDetail() {
    const root = document.getElementById("project-detail");
    if (!root) return;
    const params = new URLSearchParams(location.search);
    const project = projects.find((entry) => entry.id === params.get("project"));
    if (!project) {
      root.replaceChildren(node("h1", "", "프로젝트를 찾을 수 없습니다."), link("프로젝트 목록으로", "../index.html#work", "button button-dark"));
      return;
    }
    document.title = project.title + " | 최윤성 포트폴리오";
    const back = link("← 전체 프로젝트", "../index.html#work", "back-link");
    const intro = node("section", "detail-intro");
    const heading = node("div", "detail-heading");
    append(heading, node("p", "eyebrow", project.category), node("h1", "", project.title), node("p", "detail-lead", project.description));
    if (project.url) heading.append(link("GitHub에서 코드 보기 ↗", project.url, "button button-dark", true));
    const facts = node("dl", "detail-facts");
    line(facts, "유형", project.type);
    line(facts, "작업 기간", project.duration);
    line(facts, "진행 형태", project.context);
    line(facts, "사용 도구", project.tools?.join(" · "));
    line(facts, "작업 범위", project.scope);
    line(facts, "확인 범위", project.verification);
    append(intro, heading, facts);
    root.replaceChildren(back, intro);

    const documents = project.documents;

    if (documents.length) {
      const area = node("section", "document-area");
      area.id = "documents";
      const bar = node("div", "section-heading");
      const title = node("div");
      append(title, node("p", "eyebrow", "DOCUMENTS / " + String(documents.length).padStart(2, "0")), node("h2", "", "프로젝트 자료"));
      append(bar, title, node("p", "", "목록에서 PDF를 선택하세요."));
      const layout = node("div", "document-layout");
      const list = node("nav", "document-list");
      list.setAttribute("aria-label", "프로젝트 자료 목록");
      const viewer = node("div", "pdf-panel");
      const toolbar = node("div", "pdf-toolbar");
      const toolbarTitle = node("strong", "pdf-title");
      const count = node("span", "pdf-count");
      const toolbarActions = node("div", "pdf-toolbar-actions");
      const previous = node("button", "toolbar-button", "이전");
      previous.type = "button";
      const next = node("button", "toolbar-button", "다음");
      next.type = "button";
      const fullscreen = node("button", "toolbar-button", "전체 화면");
      fullscreen.type = "button";
      const original = link("원본 열기 ↗", "#", "toolbar-link", true);
      const download = link("다운로드 ↓", "#", "toolbar-link");
      download.setAttribute("download", "");
      append(toolbarActions, previous, next, fullscreen, original, download);
      append(toolbar, append(node("div", "pdf-toolbar-label"), toolbarTitle, count), toolbarActions);
      const stage = node("div", "pdf-stage");
      const frame = node("iframe", "pdf-frame");
      frame.title = "PDF 결과물";
      frame.setAttribute("loading", "eager");
      stage.append(frame);
      const pendingMessage = node("div", "pdf-pending-state");
      append(viewer, toolbar, stage);
      append(layout, list, viewer);
      append(area, bar, layout);
      root.append(area);

      let selectedIndex = 0;
      const buttons = [];
      let lastGroup = "";
      documents.forEach((item, index) => {
        if (item.group !== lastGroup) {
          list.append(node("p", "document-group", item.group));
          lastGroup = item.group;
        }
        const button = node("button", "document-row");
        button.type = "button";
        button.dataset.document = item.id;
        button.classList.toggle("is-pending", !item.file);
        const thumb = node("span", "document-thumb");
        if (item.thumbnail) {
          const image = node("img");
          image.src = asset(item.thumbnail);
          image.alt = "";
          image.loading = "lazy";
          thumb.append(image);
        } else {
          thumb.textContent = "PDF";
        }
        const labels = node("span", "document-row-labels");
        append(labels, node("small", "", String(index + 1).padStart(2, "0") + " / " + item.group + (!item.file ? " · 준비 중" : item.pages ? " · " + item.pages + "쪽" : "")), node("strong", "", item.title));
        append(button, thumb, labels, node("span", "document-row-arrow", "↗"));
        button.addEventListener("click", () => select(index, true));
        buttons.push(button);
        list.append(button);
      });
      function select(index, updateAddress) {
        selectedIndex = index;
        const item = documents[index];
        const file = item.file ? asset(item.file) : null;
        toolbarTitle.textContent = item.title;
        count.textContent = String(index + 1).padStart(2, "0") + " / " + String(documents.length).padStart(2, "0") + (!file ? " · 준비 중" : item.pages ? " · " + item.pages + "쪽" : "");
        frame.title = item.title + " PDF";
        if (file) {
          stage.replaceChildren(frame);
          frame.src = file + "#page=" + (item.firstPage || 1) + "&view=FitH";
          original.href = file;
          download.href = file;
          download.setAttribute("download", item.file.split("/").pop());
        } else {
          frame.removeAttribute("src");
          pendingMessage.replaceChildren(node("p", "eyebrow", "PDF 준비 중"), node("strong", "", item.title), node("p", "", "자료를 준비하고 있습니다."));
          stage.replaceChildren(pendingMessage);
          original.removeAttribute("href");
          download.removeAttribute("href");
          download.removeAttribute("download");
        }
        original.hidden = !file;
        download.hidden = !file;
        fullscreen.disabled = !file;
        previous.disabled = index === 0;
        next.disabled = index === documents.length - 1;
        buttons.forEach((button, buttonIndex) => {
          const active = index === buttonIndex;
          button.classList.toggle("active", active);
          if (active) button.setAttribute("aria-current", "true");
          else button.removeAttribute("aria-current");
        });
        if (updateAddress) history.replaceState(null, "", detailUrl(project, item.id) + "#documents");
      }
      previous.addEventListener("click", () => select(selectedIndex - 1, true));
      next.addEventListener("click", () => select(selectedIndex + 1, true));
      fullscreen.addEventListener("click", () => stage.requestFullscreen?.());
      const requestedIndex = documents.findIndex((item) => item.id === params.get("document"));
      select(requestedIndex >= 0 ? requestedIndex : 0, false);
    } else if (project.url) {
      const development = node("section", "development-detail");
      append(development, node("p", "eyebrow", "PROJECT DETAILS"), node("h2", "", "주요 개발 내용"));
      const points = node("ul");
      project.highlights.forEach((highlight) => points.append(node("li", "", highlight)));
      append(development, points);
      root.append(development);
    }

  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  if (page === "home") renderHome();
  if (page === "detail") renderDetail();

  const header = document.querySelector(".site-header");
  if (header) {
    const syncHeaderHeight = () => document.documentElement.style.setProperty("--header-height", header.getBoundingClientRect().height + "px");
    syncHeaderHeight();
    if ("ResizeObserver" in window) new ResizeObserver(syncHeaderHeight).observe(header);
    else window.addEventListener("resize", syncHeaderHeight);
  }

  function setupHomeEffects() {
    if (!header) return;
    const progress = node("span", "reading-progress");
    progress.setAttribute("aria-hidden", "true");
    header.append(progress);
    const navigation = Array.from(header.querySelectorAll('nav a[href^="#"]'))
      .map((anchor) => ({ anchor, section: document.getElementById(anchor.hash.slice(1)) }))
      .filter((entry) => entry.section);
    let scrollFrame = 0;
    const updateNavigation = () => {
      scrollFrame = 0;
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maximum > 0 ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0;
      progress.style.transform = "scaleX(" + ratio + ")";
      header.classList.toggle("is-scrolled", window.scrollY > 12);
      let active = navigation[0];
      const threshold = header.getBoundingClientRect().bottom + window.innerHeight * 0.2;
      navigation.forEach((entry) => {
        if (entry.section.getBoundingClientRect().top <= threshold) active = entry;
      });
      if (maximum > 0 && window.scrollY >= maximum - 2) active = navigation[navigation.length - 1];
      navigation.forEach((entry) => {
        if (entry === active) entry.anchor.setAttribute("aria-current", "location");
        else entry.anchor.removeAttribute("aria-current");
      });
    };
    const scheduleNavigation = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateNavigation);
    };
    window.addEventListener("scroll", scheduleNavigation, { passive: true });
    window.addEventListener("resize", scheduleNavigation, { passive: true });
    updateNavigation();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const precisionPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const resets = [];
    document.querySelectorAll(".hero-aside, .project-card, .project-card-visual, .tech-group").forEach((surface) => {
      let pointerFrame = 0;
      let pointerX = 0;
      let pointerY = 0;
      const reset = () => {
        if (pointerFrame) cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
        surface.classList.remove("is-pointer-active");
        ["--pointer-x", "--pointer-y", "--tilt-x", "--tilt-y"].forEach((property) => surface.style.removeProperty(property));
      };
      const updatePointer = () => {
        pointerFrame = 0;
        if (reducedMotion.matches || !precisionPointer.matches) return;
        const bounds = surface.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const x = Math.min(1, Math.max(0, (pointerX - bounds.left) / bounds.width));
        const y = Math.min(1, Math.max(0, (pointerY - bounds.top) / bounds.height));
        surface.style.setProperty("--pointer-x", (x * 100).toFixed(2) + "%");
        surface.style.setProperty("--pointer-y", (y * 100).toFixed(2) + "%");
        surface.style.setProperty("--tilt-x", ((0.5 - y) * 5).toFixed(2) + "deg");
        surface.style.setProperty("--tilt-y", ((x - 0.5) * 5).toFixed(2) + "deg");
        surface.classList.add("is-pointer-active");
      };
      surface.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse" || reducedMotion.matches || !precisionPointer.matches) return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
      }, { passive: true });
      surface.addEventListener("pointerleave", reset);
      surface.addEventListener("pointercancel", reset);
      resets.push(reset);
    });
    const resetPointers = () => resets.forEach((reset) => reset());
    reducedMotion.addEventListener?.("change", resetPointers);
    precisionPointer.addEventListener?.("change", resetPointers);
    window.addEventListener("blur", resetPointers);
    window.addEventListener("scroll", resetPointers, { passive: true });
  }

  if (page === "home") setupHomeEffects();

})();
