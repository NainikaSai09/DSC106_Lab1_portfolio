console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$("nav a");
// console.log(navLinks);

// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );

// currentLink?.classList.add('current');

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: "contact/", title: "Contact" },
  { url: "resume/", title: "Resume" },
  { url: "https://github.com/NainikaSai09", title: "Profile" }
];

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"
    : "/DSC106_Lab1_portfolio/";

let nav = document.createElement('nav');
document.body.prepend(nav);

document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select>
		  <option value="light dark">Automatic</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
		</select>
	</label>`,
);

let select = document.querySelector(".color-scheme select");

// Function to apply theme
function setColorScheme(value) {
  document.documentElement.style.setProperty("color-scheme", value);
}

// 1. When user changes dropdown
select.addEventListener("input", function (event) {
  let value = event.target.value;

  setColorScheme(value);

  // Save preference
  localStorage.colorScheme = value;

  console.log("Saved theme:", value);
});

// 2. When page loads (restore preference)
if ("colorScheme" in localStorage) {
  let saved = localStorage.colorScheme;

  setColorScheme(saved);

  // Update dropdown to match
  select.value = saved;
}

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !url.startsWith("http") ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  a.classList.toggle(
  'current',
  a.host === location.host && a.pathname === location.pathname,
);

  // Open external links in new tab
  a.toggleAttribute("target", a.host !== location.host);
  nav.append(a);

}


let form = document.querySelector("form");

form?.addEventListener("submit", function (event) {
  event.preventDefault(); // stop default behavior

  let data = new FormData(form);

  let url = form.action + "?";
  let params = [];

  for (let [name, value] of data) {
    let encodedValue = encodeURIComponent(value);
    params.push(`${name}=${encodedValue}`);
  }

  url += params.join("&");

  console.log("Generated URL:", url);

  // Open email client
  location.href = url;
});

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error fetching or parsing JSON data:", error);
  }
}


export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // Safety check
  if (!containerElement) {
    console.error("Container element not found");
    return;
  }

  // Clear old content
  containerElement.innerHTML = '';

  // Loop through projects
  for (let project of projects) {
    const article = document.createElement('article');

    // Dynamic heading tag
    const heading = document.createElement(headingLevel);
    heading.textContent = project.title;

    // Image
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title;

    // Description
    const p = document.createElement('p');
    p.textContent = project.description;

    // Append everything
    article.appendChild(heading);
    article.appendChild(img);
    article.appendChild(p);

    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  // return statement here

  return fetchJSON(`https://api.github.com/users/${username}`);
}