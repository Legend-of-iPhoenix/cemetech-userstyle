new Tweak("Add fullscreen post editor", /cemetech\.net\/forum\/posting\.php/, () => {
	const form = document.querySelector("form[name=post]");

	const columns = document.createElement("div");
	columns.classList = "posteditor_columns";
	form.appendChild(columns);

	columns.innerHTML = `
		<div class='column' style='flex-grow: 3;'>
			<span class='title'>Preview</span>
			<div id='realtime_preview_error'></div>
			<div id='realtime_preview'></div>
		</div>
		<div class='resize_handle'></div>
		<div class='column' id='editor' style='flex-grow: 3;'>
			<span class='title'>Editor
				<a id='close_editor' onclick=\"document.querySelector('.posteditor_columns').classList.remove('visible');\">Close</a>
			</span>
			<textarea id='fullscreen_editor'></textarea>
		</div>`;

	const message = document.querySelector("form[name=post] textarea[name=message]");
	const fullscreen_editor = document.getElementById("fullscreen_editor");

	fullscreen_editor.value = message.value;

	const fullscreen_widget = document.createElement("span");
	fullscreen_widget.innerHTML = "&#x26F6;"; // U+26F6 "SQUARE FOUR CORNERS" ⛶
	fullscreen_widget.id = "fullscreen_widget";
	message.parentNode.insertBefore(fullscreen_widget, message.nextSibling);

	function realignFullscreenWidget() {
		// move widget out of the way of the scrollbar if needed
		const newOffset = "calc(-1em - " + (message.offsetWidth - message.clientWidth) + "px)";

		if (fullscreen_widget.style.marginLeft != newOffset) {
			fullscreen_widget.style.marginLeft = newOffset;
		}
	}

	function generatePreview() {
		const realtime_preview_error = document.getElementById("realtime_preview_error");
		try {
			document.getElementById("realtime_preview").innerHTML = BBCodeToHTML(fullscreen_editor.value);
			realtime_preview_error.style.display = "none";
		} catch (error) {
			realtime_preview_error.style.display = "block";
			realtime_preview_error.innerText = error.message;
		}
	}

	fullscreen_widget.addEventListener("click", (event) => {
		columns.classList.add("visible");

		generatePreview();
	});

	message.addEventListener("input", (event) => {
		fullscreen_editor.value = message.value;
		
		realignFullscreenWidget();
	});
	
	fullscreen_editor.addEventListener("input", (event) => {
		message.value = event.target.value;

		generatePreview();
	});

	columns.addEventListener("keyup", (event) => {
		if (event.key == "Escape") {
			columns.classList.remove("visible");
		}
	});

	attachResizeListeners();
	realignFullscreenWidget();
});
