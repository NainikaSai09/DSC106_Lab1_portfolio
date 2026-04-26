import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let query = '';
let selectedIndex = -1;

function getFilteredProjects(allProjects, currentData) {
  return allProjects.filter((project) => {

    // search match
    let matchesSearch = Object.values(project)
      .join(' ')
      .toLowerCase()
      .includes(query);

    // year match
    let matchesYear =
      selectedIndex === -1 ||
      project.year === currentData[selectedIndex]?.label;

    return matchesSearch && matchesYear;
  });
}


const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');


renderProjects(projects, projectsContainer, 'h2');

renderPieChart(projects);

const projectsTitle = document.querySelector('.projects-title');

if (projectsTitle) {
  projectsTitle.textContent = `Projects (${projects.length})`;
}

let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  // update query value
  query = event.target.value.toLowerCase();
  // filter projects
  let filteredProjects = getFilteredProjects(projects, d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year
  ).map(([year, count]) => ({ value: count, label: year })));

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});


function renderPieChart(projectsGiven) {

  // 1. roll up data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  // 2. map to usable format
  let newData = newRolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  // 3. generators
  let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let newSliceGenerator = d3.pie().value((d) => d.value);

  // 4. compute arcs
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => newArcGenerator(d));

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  // 5. CLEAR old chart
  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  // 6. draw slices
  newArcs.forEach((arc, i) => {
  svg.append('path')
    .attr('d', arc)
    .attr('fill', colors(i))
    .attr('class', i === selectedIndex ? 'selected' : '')
    .on('click', () => {

  // toggle selection
      selectedIndex = selectedIndex === i ? -1 : i;

  // update slice highlight
      svg.selectAll('path')
        .attr('class', (_, idx) =>
          idx === selectedIndex ? 'selected' : ''
        );

  // update legend highlight
      legend.selectAll('li')
        .attr('class', (_, idx) =>
          idx === selectedIndex ? 'legend-item selected' : 'legend-item'
        );

  
      let filteredProjects = getFilteredProjects(projects, newData);
      renderProjects(filteredProjects, projectsContainer, 'h2');
    });
    });

  // 7. draw legend
  newData.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', idx === selectedIndex ? 'legend-item selected' : 'legend-item')
      .html(`
        <span class="swatch"></span>
        ${d.label} <em>(${d.value})</em>
      `);
  });
}


