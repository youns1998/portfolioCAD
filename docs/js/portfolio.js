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

  function renderHome() {
    const list = document.getElementById("project-list");
    if (!list) return;
    list.replaceChildren();
    projects.forEach((project, index) => {
      const article = node("article", "project-card");
      const figure = node("div", "project-card-visual");
      const thumbnail = project.documents.find((item) => item.thumbnail)?.thumbnail;
      if (thumbnail) {
        const image = node("img");
        image.src = asset(thumbnail);
        image.alt = project.title + " 도면 미리보기";
        image.loading = "lazy";
        figure.append(image);
      } else {
        append(figure, node("span", "visual-grid"), node("span", "visual-label", project.category));
      }
      figure.append(node("span", "visual-number", String(index + 1).padStart(2, "0")));
      const copy = node("div", "project-card-copy");
      append(copy, node("p", "eyebrow", project.category), node("h3", "", project.title), node("p", "project-card-description", project.description));
      const meta = node("dl", "project-card-meta");
      line(meta, "TYPE", project.type);
      line(meta, "TOOLS", project.tools?.join(" · "));
      line(meta, "RESULT", project.documents.length ? project.documents.length + "개 PDF · " + project.documents.reduce((sum, item) => sum + (item.pages || 0), 0) + "쪽" : "GitHub 저장소");
      copy.append(meta);
      const actions = node("div", "project-actions");
      if (project.documents.length) {
        actions.append(link("PDF 바로 보기 ↗", detailUrl(project, project.documents[0].id) + "#documents", "button button-dark"));
        actions.append(link("프로젝트 상세", detailUrl(project), "text-link"));
      } else {
        actions.append(link("프로젝트 상세 ↗", detailUrl(project), "button button-dark"));
        if (project.url) actions.append(link("GitHub 열기 ↗", project.url, "text-link", true));
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

    if (project.documents.length) {
      const area = node("section", "document-area");
      area.id = "documents";
      const bar = node("div", "section-heading");
      const title = node("div");
      append(title, node("p", "eyebrow", "DOCUMENTS / " + String(project.documents.length).padStart(2, "0")), node("h2", "", "결과물 보기"));
      append(bar, title, node("p", "", "도면을 선택하면 아래에서 바로 열립니다."));
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
      append(viewer, toolbar, stage, node("p", "viewer-hint", "PDF 안의 페이지 이동과 확대 기능은 브라우저 PDF 도구 모음에서 사용할 수 있습니다."));
      append(layout, list, viewer);
      append(area, bar, layout);
      root.append(area);

      let selectedIndex = 0;
      const buttons = [];
      let lastGroup = "";
      project.documents.forEach((item, index) => {
        if (item.group !== lastGroup) {
          list.append(node("p", "document-group", item.group));
          lastGroup = item.group;
        }
        const button = node("button", "document-row");
        button.type = "button";
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
        append(labels, node("small", "", String(index + 1).padStart(2, "0") + " / " + item.group + (item.pages ? " · " + item.pages + "쪽" : "")), node("strong", "", item.title));
        append(button, thumb, labels, node("span", "document-row-arrow", "↗"));
        button.addEventListener("click", () => select(index, true));
        buttons.push(button);
        list.append(button);
      });
      function select(index, updateAddress) {
        selectedIndex = index;
        const item = project.documents[index];
        const file = asset(item.file);
        toolbarTitle.textContent = item.title;
        count.textContent = String(index + 1).padStart(2, "0") + " / " + String(project.documents.length).padStart(2, "0") + (item.pages ? " · " + item.pages + "쪽" : "");
        frame.title = item.title + " PDF";
        frame.src = file + "#page=" + (item.firstPage || 1) + "&view=FitH";
        original.href = file;
        download.href = file;
        download.setAttribute("download", item.file.split("/").pop());
        previous.disabled = index === 0;
        next.disabled = index === project.documents.length - 1;
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
      const requestedIndex = project.documents.findIndex((item) => item.id === params.get("document"));
      select(requestedIndex >= 0 ? requestedIndex : 0, false);
    } else if (project.url) {
      const development = node("section", "development-detail");
      append(development, node("p", "eyebrow", "PROJECT DETAILS"), node("h2", "", "주요 작업"));
      const points = node("ul");
      project.highlights.forEach((highlight) => points.append(node("li", "", highlight)));
      append(development, points);
      root.append(development);
    }
    if (project.documents.length) {
      const notes = node("section", "project-notes");
      append(notes, node("p", "eyebrow", "PROJECT NOTES"), node("h2", "", "도면에서 볼 수 있는 내용"));
      const points = node("ul");
      project.highlights.forEach((highlight) => points.append(node("li", "", highlight)));
      notes.append(points);
      root.append(notes);
    }
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  if (page === "home") renderHome();
  if (page === "detail") renderDetail();

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
})();
