const mermaidConfig = {
  startOnLoad: false,
  theme: "neutral",
  flowchart: { curve: "basis" },
};

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.textContent = value || "";
}

function renderList(containerSelector, items, formatter) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = "";
  const list = items && items.length ? items : ["Not available"];
  list.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = formatter ? formatter(item) : item;
    container.appendChild(li);
  });
}

function renderChips(containerSelector, groups) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = "";
  const chips = [];
  Object.entries(groups || {}).forEach(([label, values]) => {
    if (!values || !values.length) return;
    values.forEach((value) => chips.push(`${label}: ${value}`));
  });
  if (!chips.length) {
    chips.push("Stack: unknown");
  }
  chips.forEach((chip) => {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = chip;
    container.appendChild(span);
  });
}

function renderDiagram(selector, diagram) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.textContent = diagram || "graph TD\n  A[No diagram available]";
}

function applyReveal() {
  const revealEls = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

function setupFileFilter(files) {
  const listEl = document.querySelector("[data-files]");
  const inputEl = document.querySelector("[data-file-filter]");
  const countEl = document.querySelector("[data-file-count]");
  if (!listEl || !inputEl || !countEl) return;

  const render = (filterValue) => {
    listEl.innerHTML = "";
    const filtered = files.filter((file) =>
      file.toLowerCase().includes(filterValue.toLowerCase())
    );
    countEl.textContent = `${filtered.length} files`;
    filtered.forEach((file) => {
      const li = document.createElement("li");
      li.textContent = file;
      listEl.appendChild(li);
    });
  };

  inputEl.addEventListener("input", (event) => {
    render(event.target.value || "");
  });

  render("");
}

async function init() {
  mermaid.initialize(mermaidConfig);
  const response = await fetch("data.json");
  const data = await response.json();

  setText("[data-title]", data.title || "Project");
  setText("[data-description]", data.description || "Project overview");
  setText(
    "[data-generated]",
    data.generatedAt ? `Generated ${data.generatedAt}` : ""
  );
  setText("[data-repo]", data.repoPath || "");

  renderChips("[data-stack]", data.stack);
  renderList("[data-overview]", data.overview || []);
  renderList("[data-entrypoints]", data.entrypoints || [], (item) => 
    item.note ? `${item.path} - ${item.note}` : item.path
  );
  renderList("[data-key-files]", data.keyFiles || [], (item) => 
    item.note ? `${item.path} - ${item.note}` : (item.path || item)
  );
  renderList("[data-commands]", data.commands || [], (item) => 
    item.note ? `${item.command} - ${item.note}` : item.command
  );
  renderList("[data-dependencies]", data.dependencies || [], (item) => 
    item.group ? `${item.name} (${item.group})` : item.name
  );

  renderDiagram("[data-diagram=\"architecture\"]", data.diagrams?.architecture);
  renderDiagram("[data-diagram=\"dataFlow\"]", data.diagrams?.dataFlow);
  renderDiagram("[data-diagram=\"taskFlow\"]", data.diagrams?.taskFlow);
  renderDiagram("[data-diagram=\"householdFlow\"]", data.diagrams?.householdFlow);
  renderDiagram("[data-diagram=\"entityRelationship\"]", data.diagrams?.entityRelationship);

  await mermaid.run({
    nodes: document.querySelectorAll(".mermaid"),
  });

  setupFileFilter(data.files || []);
  applyReveal();
}

init().catch((error) => {
  console.error("Failed to load project data", error);
});
