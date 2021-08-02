// styles from noahk's chrome extension
new Tweak("Add fullscreen button to sc3.", /cemetech\.net\/sc/, () => {
	const button = document.createElement("a"); // great web design right here
	const innerDiv = document.createElement("div");

	innerDiv.innerHTML = "<span style='color: white;'>&#x26F6;</span> Toggle Fullscreen"; // U+26F6 "SQUARE FOUR CORNERS" ⛶"
	innerDiv.classList = "sc3_interface_button";
	button.appendChild(innerDiv);

	document.getElementsByClassName("project_pane")[0].appendChild(button);

	button.onclick = () => document.body.classList.toggle("sc3Fullscreen");
});