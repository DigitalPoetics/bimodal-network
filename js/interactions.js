// root element of autocomplete
const root = document.querySelector(".autocomplete");
root.innerHTML = `
    <input class="input" placeholder="Find a node" />
    <div class="dropdown">
        <div class="dropdown-menu">
            <div class="dropdown-content results"></div>
        </div>
    </div>
`;

// search box input and style
const input = document.querySelector("input");
const dropdown = document.querySelector(".dropdown");
const resultsWrapper = document.querySelector(".results");

// look-up input in nodes data
const fetchData = (searchTerm) => {
  const nodes = [];
  const labels = document.querySelectorAll("#network text");
  const labelsArr = Array.from(labels);

  console.dir(labelsArr);
  labelsArr.forEach((item, index, arr) => {
    if (!item.innerHTML.toLowerCase().includes(searchTerm)) {
      return;
    }
    // if the search term is an empty string
    if (!searchTerm) {
      return;
    } else {
      nodes.push(item);
    }
  });

  //   print nodes
  // option nmenu
  //close dropdown if no data
  if (!searchTerm) {
    dropdown.classList.remove("is-active");
    return;
  }
  // open dropdown
  resultsWrapper.innerHTML = "";
  dropdown.classList.add("is-active");
  for (let node of nodes) {
    const option = document.createElement("a");
    option.classList.add("dropdown-item");
    option.innerHTML = `
          <p>${node.innerHTML}</p>
              `;
    // click event on option
    option.addEventListener("click", () => {
      dropdown.classList.remove("is-active");
      // change input value to the node
      input.value = node.innerHTML;
      // helper function to render HTML
      onNodeSelect(node);
      onNodeRemove(node);
    });
    resultsWrapper.appendChild(option);
  }
};

// input event and search term
let formData = {};
let searchTerm = "xyz";
// search term
const onInput = (event) => {
  // retrieve input term
  formData["term"] = event.target.value;
  // console.log("form data", formData);
  searchTerm = formData["term"].toLowerCase();
  console.log("search label", searchTerm);
  // poet nodes
  fetchData(searchTerm);
};

// debounce
// input.addEventListener("input", onInput);
input.addEventListener("input", debounce(onInput, 500));

// close menu option
document.addEventListener("click", (event) => {
  if (!root.contains(event.target)) {
    dropdown.classList.remove("is-active");
  }
});

// helper function
const onNodeSelect = (node) => {
  // select the node summary and append span
  const nodeSpan = document.createElement("span");
  nodeSpan.classList.add("tag", "node-text");
  nodeSpan.setAttribute("id", `${node.innerHTML}`);
  nodeSpan.innerHTML = `${node.innerHTML}<button class="delete is-small"></button>`;
  // append
  document.querySelector("#nodeSummary").appendChild(nodeSpan);

  // add node glow function
  nodeGlow(node);
};


// glow
const nodeGlow = (nodeGlow) => {
  //add glow
  nodeGlow.classList.add("glow");
};

// helper function
const onNodeRemove = (node) => {
  removeNodeTemplate(node);
  //   removeNodeGlow();
};
// deselect

const removeNodeTemplate = (removedNode) => {
  const nodeIcons = document.querySelectorAll(".node-text");
  const nodeIconsArr = Array.from(nodeIcons);
  // on click
  nodeIcons.forEach((el) => {
    el.addEventListener("click", () => {
      el.remove();
      // remove glow
      if (removedNode.innerHTML === el.id) {
        removedNode.classList.remove("glow");
      } else {
        return;
      }
    });
  });
};
