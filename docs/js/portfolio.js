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
    const list = document.getElementById("project-list");
    if (!list) return;
    list.replaceChildren();
    projects.forEach((project, index) => {
      const article = node("article", "project-card");
      article.dataset.project = project.id;
      const figure = node("div", "project-card-visual");
      const documents = project.documents.filter((item) => item.file);
      const thumbnail = documents.find((item) => item.thumbnail)?.thumbnail;
      if (project.video?.file) {
        figure.append(createVideoStage(project.video, thumbnail));
      } else if (thumbnail) {
        const image = node("img");
        image.src = asset(thumbnail);
        image.alt = project.title + " 도면 미리보기";
        image.loading = "lazy";
        figure.append(image);
      } else {
        append(figure, node("span", "visual-grid"), node("span", "visual-label", project.video ? "SketchUp / Visualization" : project.category));
      }
      figure.append(node("span", "visual-number", String(index + 1).padStart(2, "0")));
      const copy = node("div", "project-card-copy");
      append(copy, node("p", "eyebrow", project.category), node("h3", "", project.title), node("p", "project-card-description", project.description));
      const actions = node("div", "project-actions");
      if (project.documents.length || project.video) {
        const meta = node("dl", "project-card-meta");
        line(meta, "TYPE", project.type);
        line(meta, "TOOLS", project.tools?.join(" · "));
        if (documents.length) line(meta, "RESULT", documents.length + "개 PDF · " + documents.reduce((sum, item) => sum + (item.pages || 0), 0) + "쪽");
        copy.append(meta);
        actions.append(link("프로젝트 상세 ↗", detailUrl(project), "button button-dark"));
      } else {
        const meta = node("dl", "project-card-meta");
        line(meta, "TYPE", project.type);
        line(meta, "TOOLS", project.tools?.join(" · "));
        copy.append(meta);
        if (project.highlights?.length) {
          const features = node("div", "project-card-features");
          features.append(node("p", "eyebrow", "KEY FEATURES"));
          const points = node("ul");
          project.highlights.slice(0, 3).forEach((highlight) => points.append(node("li", "", highlight)));
          features.append(points);
          copy.append(features);
        }
        if (project.url) actions.append(link("GitHub 열기 ↗", project.url, "button button-dark", true));
      }
      copy.append(actions);
      append(article, figure, copy);
      list.append(article);
    });
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
    if (project.url) heading.append(link("GitHub에서 구현 보기 ↗", project.url, "button button-dark", true));
    const facts = node("dl", "detail-facts");
    line(facts, "유형", project.type);
    line(facts, "도구", project.tools?.join(" · "));
    line(facts, "작업", project.scope);
    append(intro, heading, facts);
    root.replaceChildren(back, intro);

    const documents = project.documents;

    if (documents.length) {
      const area = node("section", "document-area");
      area.id = "documents";
      const bar = node("div", "section-heading");
      const title = node("div");
      append(title, node("p", "eyebrow", "DOCUMENTS / " + String(documents.length).padStart(2, "0")), node("h2", "", "결과물 보기"));
      append(bar, title, node("p", "", "목록에서 자료를 선택하면 바로 열립니다."));
      const layout = node("div", "document-layout");
      const list = node("nav", "document-list");
      list.setAttribute("aria-label", "PDF 도면 목록");
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
      append(development, node("p", "eyebrow", "PROJECT DETAILS"), node("h2", "", "주요 작업"));
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

  if (page === "home" && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const sections = document.querySelectorAll("[data-reveal], .project-card");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    sections.forEach((section) => {
      section.classList.add("reveal");
      observer.observe(section);
    });
    document.documentElement.classList.add("motion-ready");
  }

  function setupSectionScroll() {
    if (page !== "home") return;
    const panels = Array.from(document.querySelectorAll(".scroll-panel"));
    const precisionPointer = window.matchMedia("(min-width: 901px) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wheelThreshold = 150;
    const transitionDuration = 1050;
    let wheelTotal = 0;
    let wheelDirection = 0;
    let lastWheelAt = 0;
    let animationFrame = 0;
    let animationActive = false;
    let controllerActive = false;

    const headerHeight = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 0;
    const panelTop = (panel) => Math.max(0, panel.offsetTop - headerHeight());
    const panelBottomTarget = (panel) => Math.max(panelTop(panel), panel.offsetTop + panel.offsetHeight - window.innerHeight);
    const isCompact = (panel) => panel.offsetHeight <= window.innerHeight + 8;
    const resetWheel = () => {
      wheelTotal = 0;
      wheelDirection = 0;
      lastWheelAt = 0;
    };
    const easeInOut = (progress) => progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    function animateTo(target, hash) {
      const start = window.scrollY;
      const distance = target - start;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      animationActive = false;
      if (Math.abs(distance) < 2) {
        if (hash && location.hash !== hash) history.pushState(null, "", hash);
        return;
      }
      animationActive = true;
      const startedAt = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - startedAt) / transitionDuration);
        window.scrollTo(0, start + distance * easeInOut(progress));
        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
          return;
        }
        animationFrame = 0;
        animationActive = false;
        window.scrollTo(0, target);
        if (hash && location.hash !== hash) history.pushState(null, "", hash);
      };
      animationFrame = requestAnimationFrame(step);
    }

    function currentPanelIndex() {
      const position = window.scrollY + headerHeight() + 2;
      const index = panels.findIndex((panel) => position >= panel.offsetTop && position < panel.offsetTop + panel.offsetHeight);
      return index >= 0 ? index : 0;
    }

    function destinationFor(index, direction) {
      const destinationIndex = index + direction;
      if (destinationIndex < 0 || destinationIndex >= panels.length) return null;
      const destination = panels[destinationIndex];
      return direction < 0 && !isCompact(destination) ? panelBottomTarget(destination) : panelTop(destination);
    }

    function shouldControl(panel, direction) {
      const tolerance = 4;
      if (isCompact(panel)) return Math.abs(window.scrollY - panelTop(panel)) <= tolerance;
      if (direction > 0) return window.scrollY >= panelBottomTarget(panel) - tolerance;
      return window.scrollY <= panelTop(panel) + tolerance;
    }

    function onWheel(event) {
      if (!controllerActive || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (animationActive) {
        event.preventDefault();
        return;
      }
      const normalizedDelta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      if (Math.abs(normalizedDelta) < 1) return;
      const direction = normalizedDelta > 0 ? 1 : -1;
      const index = currentPanelIndex();
      const panel = panels[index];
      const destination = destinationFor(index, direction);
      if (destination === null || !shouldControl(panel, direction)) {
        resetWheel();
        return;
      }
      event.preventDefault();
      const now = performance.now();
      if (direction !== wheelDirection || now - lastWheelAt > 280) wheelTotal = 0;
      wheelDirection = direction;
      lastWheelAt = now;
      wheelTotal += Math.abs(normalizedDelta);
      if (wheelTotal < wheelThreshold) return;
      resetWheel();
      animateTo(destination);
    }

    function onAnchorClick(event) {
      if (!controllerActive || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const hash = anchor.getAttribute("href");
      const target = hash === "#top" ? document.querySelector(".hero") : document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      resetWheel();
      animateTo(panelTop(target), hash);
    }

    function syncController() {
      const shouldActivate = precisionPointer.matches && !reducedMotion.matches;
      if (shouldActivate === controllerActive) return;
      controllerActive = shouldActivate;
      document.documentElement.classList.toggle("section-scroll-controlled", shouldActivate);
      if (!shouldActivate) {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        animationActive = false;
        resetWheel();
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("click", onAnchorClick);
    precisionPointer.addEventListener?.("change", syncController);
    reducedMotion.addEventListener?.("change", syncController);
    syncController();
  }

  setupSectionScroll();
})();
