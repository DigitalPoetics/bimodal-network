

async function bimodalNetwork() {
	let nodes_data;
	let links_data;
	try {
	  const linksProm = axios.get("./data/links.json");
	  const nodesProm = axios.get("./data/nodes.json");
	  const results = await Promise.all([linksProm, nodesProm]);
	  links_data = results[0].data;
	  nodes_data = results[1].data;
	} catch (err) {
	  console.log(err);
	}
  
  //Width and height
  
	let w = window.innerWidth;
	let h = (window.innerHeight * .85)
	let border = 1;
	let bordercolor = "black";
  
	//create svg somewhere to put the force directed graph
	let svg = d3
	  .select("#network")
	  .append("svg")
	  .attr("id", "networkSvg")
	  .attr("width", w)
	  .attr("height", h)
	  .attr("border", border);
  
	//border
	let borderPath = svg
	  .append("rect")
	  .attr("x", 0)
	  .attr("y", 0)
	  .attr("height", h)
	  .attr("width", w)
	  .style("stroke", bordercolor)
	  .style("fill", "white")
	  .style("stroke-width", border);
  
	let radius = 5;
  
	//set up the simulation and add forces
	let simulation = d3.forceSimulation().alpha(1).nodes(nodes_data);
  
	let link_force = d3
	  .forceLink(links_data)
	  .id(function (d) {
		return d.name;
	  })
	  .distance(50);
  
	let charge_force = d3
	  .forceManyBody()
	  .strength(-150)
	  .theta(0.5)
	  .distanceMax(400);
	let center_force = d3.forceCenter(w / 2, h / 2); //width "w" and height "h"
  
	let collision_force = d3
	  .forceCollide()
	  .strength(0.8)
	  .radius(5)
	  .iterations(10);
  
	simulation
	  .force("charge", charge_force)
	  .force("center", center_force)
	  .force("collision", collision_force)
	  .force("link", link_force);
  
	//add tick instructions:
	simulation.on("tick", tickActions);
  
	//degree
	links_data.forEach(function (link) {
	  if (!link.source["linkCount"]) link.source["linkCount"] = 0;
	  if (!link.target["linkCount"]) link.target["linkCount"] = 0;
  
	  link.source["linkCount"]++;
	  link.target["linkCount"]++;
	});
  
	//Select neighbor property
	//Toggle stores whether the highlighting is on
  
	//Create an array logging what is connected to what
	let linkedByIndex = {};
	for (i = 0; i < nodes_data.length; i++) {
	  linkedByIndex[i + "," + i] = 1;
	}
	//   console.log(linkedByIndex);
	links_data.forEach(function (d) {
	  linkedByIndex[d.source.index + "," + d.target.index] = 1;
	});
	//   console.log(linkedByIndex);
  
	//This function looks up whether a pair are neighbours
	function neighboring(a, b) {
	  return linkedByIndex[a.index + "," + b.index];
	}
	let toggle = 0;
  
	function connectedNodes() {
	  if (toggle == 0) {
		//Reduce the opacity of all but the neighbouring nodes
		d = d3.select(this).node().__data__;
		node.style("opacity", function (o) {
		  return neighboring(d, o) || neighboring(o, d) ? 1 : 0.3;
		});
		link.style("opacity", function (o) {
		  return (d.index == o.source.index) | (d.index == o.target.index)
			? 1
			: 0.3;
		});
		//Reduce the op
		toggle = 1;
	  } else {
		//Put them back to opacity=1
		node.style("opacity", 1);
		link.style("opacity", 1);
		toggle = 0;
	  }
	}
  
	//add zoom capabilities
	let zoom_handler = d3.zoom().on("zoom", zoom_actions);
  
	zoom_handler(svg);
  
	svg.on("dblclick.zoom", null);
  
	//add encompassing group for the zoom
	let g = svg.append("g").attr("class", "everything");
  
	//draw lines for the links
	let link = g
	  .append("g")
	  .attr("class", "links")
	  .selectAll("line")
	  .data(links_data)
	  .enter()
	  .append("line")
	  .attr("stroke-width", 0.1)
	  .style("stroke-opacity", 1)
	  .style("stroke", "#a6a6a6"); //linkcolor
  
	//draw circles for the nodes
	let node = g
	  .append("g")
	  .attr("class", "nodes")
	  .selectAll("circle")
	  .data(nodes_data)
	  .enter()
	  .append("circle")
	  .attr("id", (d) => d.name)
	  .attr("r", nodeSize)
	  .style("fill-opacity", 1)
	  .style("transform", translate)
	  .style("fill", circleColour); //circlecolor
  
	//   console.log(node);
	function translate(d) {
	  // get the center of svg
	  const svgElem = document.querySelector("#network svg");
	  const rectSize = svgElem.getBoundingClientRect();
	  const centerX = Math.floor((rectSize.width / 2) * 10000) / 10000;
  
	  const centerY = Math.floor((rectSize.height / 2) * 10000) / 10000;
  
	  // clockwise
	  // if (d.x > centerX) {
	  //   d.x = centerX;
	  // }
	  // if (d.x < centerX) {
	  //   d.x = centerX;
	  // }
	  // if ((d.x = centerX)) {
	  //   if (d.y > centerY) {
	  //     d.x = d.x - (d.y - centerY);
	  //   }
	  //   if (d.y < centerY) {
	  //     d.x = d.x + (centerY - d.y);
	  //   }
	  // }
	  // // change y coordinates
	  // if (d.y > centerY) {
	  //   //   d.y = centerY - d.y;
	  //   d.y = centerY;
	  // }
	  // if (d.y < centerY) {
	  //   d.y = centerY;
	  // }
	  // if ((dy = centerY)) {
	  //   if (d.x > centerX) {
	  //     d.y = d.y - (d.x - centerX);
	  //   }
	  //   if (d.x < centerX) {
	  //     d.y = d.y + (centerX - d.x);
	  //   }
	  // }
  
	  // change x coordinates 90 deegree counter-clockwise
	  if (d.x > centerX) {
		d.x = d.x - centerX;
	  }
	  if (d.x < centerX) {
		d.x = centerX - d.x;
	  }
	  if ((d.x = centerX)) {
		if (d.y > centerY) {
		  d.x = d.x + (d.y - centerY);
		}
		if (d.y < centerY) {
		  d.x = d.x - (centerY - d.y);
		}
	  }
	  // change y coordinates
	  if (d.y > centerY) {
		d.y = d.y - centerY;
	  }
	  if (d.y < centerY) {
		d.y = centerY - d.y;
	  }
	  if ((dy = centerY)) {
		if (d.x > centerX) {
		  d.y = d.y + (d.x - centerX);
		}
		if (d.x < centerX) {
		  d.y = d.y - (centerX - d.x);
		}
	  }
	}
  
	// color the circle on click
  
	// select all nodes
	let selectedCircles = document.querySelectorAll("circle");
	// add click event
	selectedCircles.forEach((item, index, array) => {
	  item.addEventListener("click", (e) => {
		// function to add class to the neighbor nodes
		connectedNodes1(e.target);
		checkbox(e.target.id);
	  });
	});
  
	function checkbox(node) {
	  const checkBtn = document.querySelectorAll("input[type='checkbox']");
  
	  checkBtn.forEach((item, index, array) => {
		if (item.parentElement.id == node) {
		  if (item.checked != true) {
			item.checked = true;
		  } else {
			item.checked = false;
		  }
		} else {
		  return;
		}
	  });
	}
  
	// add the id of the clicked node as class of the neighbor nodes
	function connectedNodes1(n) {
	  // data of the node
	  d = d3.select(n).node().__data__;
  
	  // id of the node
	  let className = n.__data__.index;
	  // on click assign id of the node as class of neighbor nodes
	  if (n.getAttribute("class") != d.index) {
		node.classed(className, function (o) {
		  if (neighboring(d, o) | neighboring(o, d)) {
			return true;
		  } else {
			return false;
		  }
		});
		link.classed(className, function (o) {
		  if (neighboring(d, o) | neighboring(o, d)) {
			return true;
		  } else {
			return false;
		  }
		});
		// color the nodes that have class
		//   onClick();
	  } else {
		// on unclick remove the node id from class of neighbors
		let nodeUnclicked = document.querySelectorAll("circle");
		nodeUnclicked.forEach((item) => {
		  item.classList.remove(`${className}`);
		});
		let linkUnclicked = document.querySelectorAll("line");
		linkUnclicked.forEach((item) => {
		  item.classList.remove(`${className}`);
		});
		// remove color from the nodes with removed class
		//   onClick();
	  }
	  onClick();
	}
	// color the nodes based on class
	function onClick() {
	  let clickedCircles = document.querySelectorAll("circle");
	  clickedCircles.forEach((item) => {
		// if the node has class, color red
		if (item.getAttribute("class")) {
		  return d3.select(item).style("fill", "#ff0000");
		} else {
		  // if the node does not have any class
		  d3.select(item).style("fill", (d) => {
			if (d.type == "member") {
			  return "#ffbd80";
			} else {
			  return "#8aded8";
			}
		  });
		}
	  });
	  let clickedLinks = document.querySelectorAll("links");
	  clickedLinks.forEach((item) => {
		// if the node has class, color red
		if (item.getAttribute("class")) {
		  return d3.select(item).style("stroke", "#ff0000");
		} else {
		  // if the node does not have any class
		  return d3.select(item).style("stroke", "black");
		}
	  });
	}
  
	// function get group name
	let groups = [];
  
	nodes_data.forEach((item) => {
	  if (item.group != "poet") {
		groups.push(item.group);
	  } else {
		return;
	  }
	});
  
	function onlyUnique(value, index, self) {
	  return self.indexOf(value) === index;
	}
  
	let uniqueGroup = groups.filter(onlyUnique);
  
	// create group labels
	let container = document.querySelector(".container-labels");
  
	uniqueGroup.forEach((item, index, array) => {
	  let categoryDiv = document.createElement("div");
	  categoryDiv.setAttribute("id", `${item}`);
	  categoryDiv.classList.add("dropdown-item", "group-label");
	  categoryDiv.innerHTML = `<p>${item}</p>`;
	  container.appendChild(categoryDiv);
	});
  
	let containerDiv = d3
	  .selectAll(".group-label")
	  .data(nodes_data)
	  .enter()
	  .each((d, i) => {
		if (d.group == "poet") {
		  return;
		} else {
		  createCheckbox(d);
		}
	  });
  
	// create checkbox
	function createCheckbox(d) {
	  let container = document.querySelectorAll(".group-label");
	  // for (let i = 0; i < container.length; i++) {
	  container.forEach((item) => {
		if (d.group == item.id) {
		  let option = document.createElement("label");
		  option.classList.add("checkbox", "dropdown-item");
		  option.setAttribute("id", `${d.name}`);
		  option.innerHTML = `<input type="checkbox">${d.name}`;
		  item.appendChild(option);
		} else {
		  return;
		}
	  });
	}
  
	// check button input
	const checkboxBtn = document.querySelectorAll("input[type='checkbox']");
	const checkBtn = d3.selectAll("input[type='checkbox']");
	checkBtn.on("click", onNodeCheck);
  
	//   on node check
	function onNodeCheck() {
	  nodeId = this.parentElement.id;
	  let selectedNodes = document.querySelectorAll("circle");
	  if (!this.checked) {
		selectedNodes.forEach((item, index) => {
		  if (item.__data__.name == nodeId) {
			connectedNodes1(item);
		  } else {
			return;
		  }
		});
	  } else {
		selectedNodes.forEach((item, index) => {
		  if (item.__data__.name == nodeId) {
			connectedNodes1(item);
		  } else {
			return;
		  }
		});
	  }
	}
  
	// draw text for the labels
	let text = g
	  .append("g")
	  .attr("class", "labels")
	  .selectAll("text")
	  .data(nodes_data)
	  .enter()
	  .append("text")
	  .attr("font-size", fontSize) //change fontsize below
	  .text(function (d) {
		return d.name;
	  })
	  .attr("text-anchor", "middle")
	  .attr("font-family", "Helvetica")
	  .style("font-weight", 10)
	  .style("pointer-events", "none")
	  .style("fill", "black")
	  .style("stroke", "black")
	  .style("stroke-width", 0.1)
	  .attr("dominant-baseline", "middle");
  
	//add drag capabilities
	let drag_handler = d3
	  .drag()
	  .on("start", drag_start)
	  .on("drag", drag_drag)
	  .on("end", drag_end);
  
	drag_handler(node);
  
	/** Functions **/
  
	function underline(d) {
	  if (d.name.toLowerCase().includes(searchLabel)) {
		console.log(d.name);
		// console.log(found)
		return "underline";
	  } else {
		return "none";
	  }
	}
  
	//Function to choose what color circle we have
	//Let's return blue for males and red for females
	function circleColour(d) {
	  if (d.type == "member") {
		return "#ffbd80";
	  } else {
		return "#8aded8";
	  }
	}
  
	//Function to choose the font size
	//If the link type is member, return a size function
	//If the link type is Institution, return another size function
  
	function fontSize(d) {
	  if (d.type == "member") {
		//edges type
		return d.linkCount ? (d.linkCount + 10) * 0.45 : 2;
	  } else {
		return d.linkCount ? d.linkCount * 0.15 : 2; // d.linkCount ? d.linkCount * 0.15 : 2; //alternatively "(d.linkCount < 5) ? d.linkCount * 3 : d.linkCount * .3"
	  }
	}
  
	//node size depending on the two groups
	function nodeSize(d) {
	  if (d.type == "member") {
		//edges type
		return d.linkCount ? (d.linkCount + 4) * 0.5 : 3; // (d.linkCount < 3) ? d.linkCount * 3 : d.linkCount * 1.5;
	  } else {
		return d.linkCount ? (d.linkCount + 5) * 0.2 : 2; // d.linkCount ? d.linkCount * 0.2 : 5; //alternatively "(d.linkCount < 5) ? d.linkCount * 3 : d.linkCount * .3"
	  }
	}
  
	//Function to choose the line color and thickness
	//If the link type is "A" return green
	//If the link type is "E" return red
  
	function linkColour(d) {
	  if (d.type == "member") {
		//edges type
		return "#d98686";
	  } else {
		return "red";
	  }
	}
  
	//Drag functions
	//d is the node
	function drag_start(d) {
	  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	  d.fx = d.x;
	  d.fy = d.y;
	}
  
	//make sure you can't drag the circle outside the box
	function drag_drag(d) {
	  d.fx = d3.event.x;
	  d.fy = d3.event.y;
	}
  
	function drag_end(d) {
	  if (!d3.event.active) simulation.alphaTarget(0);
	  d.fx = null;
	  d.fy = null;
	}
  
	//Zoom functions
	function zoom_actions() {
	  g.attr("transform", d3.event.transform);
	}
  
	function tickActions() {
	  //update circle positions each tick of the simulation
	  node
		.attr("cx", function (d) {
		  return d.x;
		})
		.attr("cy", function (d) {
		  return d.y;
		});
  
	  //update link positions
	  link
		.attr("x1", function (d) {
		  return d.source.x;
		})
		.attr("y1", function (d) {
		  return d.source.y;
		})
		.attr("x2", function (d) {
		  return d.target.x;
		})
		.attr("y2", function (d) {
		  return d.target.y;
		});
  
	  //update text positions
	  text
		.attr("x", function (d) {
		  return d.x;
		})
		.attr("y", function (d) {
		  return d.y;
		});
	}
  }

  bimodalNetwork();
  
  