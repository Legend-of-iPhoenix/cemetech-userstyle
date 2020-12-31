/* This function was yanked from SAX but it was also originally written by me (_iPhoenix_),
 *   though I'm sure I got the idea from some other piece of code I'd seen.
 *
 * Unescapes HTML entities in the unsafe input
 * `text`, creating an even more unsafe output.
 *
 * This means that unicode characters recieved by the client as already
 * escaped (ex. in post titles) will be properly rendered.
 *
 * Note that using a textarea is super duper important- using any other
 * element opens up trivial XSS attacks, and it allows us to extract the
 * value, which preserves any braces but unescapes entities.
 */
function unescapeEntities(html) {
	var txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
}

function escapeHtml(text) {
	function replaceTag(tag) {
		return {"&": "&amp;", "<": "&lt;", ">": "&gt;"}[tag] || tag;
	}
	return text.replace(/[&<>]/g, replaceTag);
}

new Tweak("Fix unicode in post titles", /cemetech\.net\/forum\/viewtopic\.php/, () => {
	const maintitle = document.querySelector(".mainheadmiddle.roundedtop .maintitle");

	maintitle.innerText = unescapeEntities(maintitle.innerText);
});

new Tweak("Fix unicode in post titles while listing topics in a subforum.", /cemetech\.net\/forum\/viewforum\.php/, () => {
	const titleLinks = Array.from(document.querySelectorAll(".topictitle > a"));

	titleLinks.forEach(titleLink => {
		titleLink.innerText = unescapeEntities(titleLink.innerText);
	})
});

new Tweak("Fix unicode in post titles while searching.", /cemetech\.net\/forum\/search\.php/, () => {
	const titleLinks = Array.from(document.querySelectorAll(".topictitle > a.topictitle"));

	titleLinks.forEach(titleLink => {
		titleLink.innerText = unescapeEntities(titleLink.innerText);
	})
});

// stolen from womp https://github.com/mrwompwomp/Cemetech-Userstyle/blob/37aca9ebc1112f660abfa33eaf086a45e14b973f/wompScript.js#L1-L15
new Tweak("Shorter dates.", /cemetech\.net\/forum\/search\.php/, () => {
	const options = {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	};

	const dates = Array.from(document.querySelectorAll("span.postdetails .indextrahigh .indextralow"));

	dates.forEach(date => {
		date.textContent = new Date(date.textContent).toLocaleDateString('en-US', options);
		date.parentNode.insertBefore(document.createElement("br"), date.nextElementSibling);
	});
});

// also stolen from womp https://github.com/mrwompwomp/Cemetech-Userstyle/blob/37aca9ebc1112f660abfa33eaf086a45e14b973f/wompScript.js#L16-L22
new Tweak("Make online users clickable.", /.*/, () => {
	const sidebar = document.querySelectorAll("p.sidebar__section-body")[0];

	const parts = sidebar.textContent.split("Members:");
	const before = parts[0];
	const names = parts[1].trim().slice(0, -1).split(", ");
	const links = names.map(name => {
		return "<a href='https://www.cemetech.net/forum/profile.php?mode=viewprofile&u=" + encodeURIComponent(name).replace(/'/g, '%27') + "'>" + escapeHtml(name) + "</a>";
	});

	sidebar.innerHTML = before + "<br>Members: " + links.join(", ") + ".";
});

//Restyle UTI pages (donated by womp)
new Tweak("Restyle UTI pages", /cemetech\.net\/projects\/uti/, () => {
	const style = document.createElement("style");
	style.innerHTML = "tr>th{border-bottom: 1px solid #254e6f !important;}section.sidebar__section,div.mainlowermiddle,div.mainheadmiddle,div#hbot,.mainbody{background:#254e6f !important;}.sidebar__section,#hbot{border: 2px solid #19364d}a{color: #222}a:hover{color:#34498B}a.largetext:hover{color:#eee}.maintitle:hover,.sidebar__section-body a:hover,.sidebar__section-header a:hover{color: white}.navsearchinput{background:#34498B !important;}img[src*='lang_english'],.navsearchsubmit,.banner_container{filter:hue-rotate(194deg);}.sax-message a{background:#1c264a},.sax-timestamp{color:#ddd}";
	document.body.append(style);
});

new Tweak("Completely redo post editor", /cemetech\.net\/forum\/posting\.php/, () => {
	const form = document.querySelector("form[name=post]");

	const columns = document.createElement("div");
	columns.classList = "posteditor_columns";
	form.appendChild(columns);

	columns.innerHTML = "<div class='column' style='flex-grow: 3;'><span class='title'>Preview</span><div id='realtime_preview'></div></div><div class='resize_handle'></div><div class='column' id='editor' style='flex-grow: 3;'><span class='title'>Editor</span><textarea id='fullscreen_editor'></textarea></div>"

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
		document.getElementById("realtime_preview").innerHTML = BBCodeToHTML(fullscreen_editor.value);
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
	})

	attachResizeListeners();
	realignFullscreenWidget();
});

// mostly stolen from womp
new GlobalTweak("Fix console error with youtube button.", /cemetech\.net\/forum\/posting\.php/, () => {
	window["y_help"] = "Youtube video: [youtube]Youtube URL[/youtube] (alt+y)";
});

// also mostly stolen from womp.
new GlobalTweak("Add strikethrough button.", /cemetech\.net\/forum\/posting\.php/, () => {
	window["st_help"] = "Strikethrough text: [strike]text[/strike] (alt+t)";
	bbtags.push('[strike]', '[/strike]');

	const container = document.createElement('span');
	container.classList = "genmed code-button-wrap";

	// I hate this
	const button = document.createElement('input');
	button.type = "button";
	button.classList = "button";
	button.accessKey = "t";
	button.style = "text-decoration: line-through;";
	button.onclick = () => bbstyle(20);
	button.onmouseover = () => helpline('st');

	button.value = "Strike";

	container.appendChild(button);
	document.querySelector(".code-buttons:first-child").appendChild(container);
});

new GlobalTweak("Add mono button.", /cemetech\.net\/forum\/posting\.php/, () => {
	window["m_help"] = "Monospaced text (inline code): [mono]text[/mono] (alt+m)";
	bbtags.push('[mono]', '[/mono]');

	const container = document.createElement('span');
	container.classList = "genmed code-button-wrap";

	const button = document.createElement('input');
	button.type = "button";
	button.classList = "button";
	button.accessKey = "m";
	button.style = "font-family: monospace;";
	button.onclick = () => bbstyle(22);
	button.onmouseover = () => helpline('m');

	button.value = "Mono";

	container.appendChild(button);
	document.querySelector(".code-buttons:first-child").appendChild(container);
});

new GlobalTweak("Add hr button.", /cemetech\.net\/forum\/posting\.php/, () => {
	window["hr_help"] = "Horizontal Rule: [hr] (alt+h)";

	const container = document.createElement('span');
	container.classList = "genmed code-button-wrap";

	const button = document.createElement('input');
	button.type = "button";
	button.classList = "button";
	button.accessKey = "h";
	button.onclick = () => insertAtCursor("\n[hr]");
	button.onmouseover = () => helpline('hr');

	button.value = "hr";

	container.appendChild(button);
	document.querySelector(".code-buttons:first-child").appendChild(container);
});
