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
	const pageTitle = document.querySelector("head > title");
    	pageTitle.textContent = unescapeEntities(pageTitle.textContent);
	const firstPostTitle = document.getElementsByClassName("post-subject indextramed")[0];
    	firstPostTitle.textContent = unescapeEntities(firstPostTitle.textContent);
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
	if (sidebar.parentElement.childElementCount == 2) {
			const parts = sidebar.textContent.split("Members:");
			const before = parts[0];
			const names = parts[1].trim().slice(0, -1).split(", ");

			const links = names.map(name => {
				return "<a href='https://www.cemetech.net/forum/profile.php?mode=viewprofile&u=" + encodeURIComponent(name).replace(/'/g, '%27') + "'>" + escapeHtml(name) + "</a>";
			});

			sidebar.innerHTML = before + "<br>Members: " + links.join(", ") + ".";
		} else {
		const parts = document.getElementsByClassName("commasep-list")[0];
		for (let i = 1; i < parts.childElementCount + 1; i++) {
			const node = parts.childNodes[i].firstElementChild;
			const name = node.textContent;
			node.innerHTML = "<a href='https://www.cemetech.net/forum/profile.php?mode=viewprofile&u=" + encodeURIComponent(name).replace(/'/g, '%27') + "'>" + escapeHtml(name) + "</a>";
		}
	}
});

//Restyle UTI pages (donated by womp)
new Tweak("Restyle UTI pages", /cemetech\.net\/projects\/uti/, () => {
	const style = document.createElement("style");
	style.innerHTML = "tr>th{border-bottom: 1px solid #254e6f !important;}section.sidebar__section,div.mainlowermiddle,div.mainheadmiddle,div#hbot,.mainbody{background:#254e6f !important;}.sidebar__section,#hbot{border: 2px solid #19364d}a{color: #222}a:hover{color:#34498B}a.largetext:hover{color:#eee}.maintitle:hover,.sidebar__section-body a:hover,.sidebar__section-header a:hover{color: white}.navsearchinput{background:#34498B !important;}img[src*='lang_english'],.navsearchsubmit,.banner_container{filter:hue-rotate(194deg);}.sax-message a{background:#1c264a},.sax-timestamp{color:#ddd}";
	document.body.append(style);
});

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

new Tweak("Completely redo post editor", /cemetech\.net\/forum\/posting\.php/, () => {
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

new Tweak("Redo Emoji Table", /cemetech\.net\/forum\/posting\.php/, () => {
	//new emoji table
	var emojiTbl = document.createElement("table");

	var emojisArr = [[":)", "icon_smile.gif", "Smile"], [":(", "icon_sad.gif", "Sad"], [":D", "icon_biggrin.gif", "Very Happy"], [":o", "icon_eek.gif", "Surprised"], [":?", "icon_confused.gif", "Confused"], ["8)", "icon_cool.gif", "Cool"], [":lol:", "icon_lol.gif", "Laughing"], [":x", "icon_mad.gif", "Mad"], [":P", "icon_razz.gif", "Razz"], [":evil:", "icon_twisted.gif", "Evil or Very Mad"], [":roll:", "icon_rolleyes.gif", "Rolling Eyes"], [":wink:", "icon_wink.gif", "Wink"], [":wacko:", "wacko.gif", "Wacko"], [":|", "icon_neutral.gif", "Neutral"], [":sleep:", "sleep.gif", "Sleep"], [":blink:", "blink.gif", "Blink"], [":cry:", "crying.gif", "Crying"], [":dry:", "dry.gif", "Dry"], [":unsure:", "unsure.gif", "Unsure"], ["@_@", "icon_shock.gif", "Shock"], [":73:", "73.gif", "TI-73"], [":83p:", "83p.gif", "TI-83+"], [":86:", "86.gif", "TI-86"], [":83pse:", "83pse.gif", "TI-83+ SE"], [":84pse:", "84pse.gif", "TI-84+ SE"], [":84p:", "84p.gif", "TI-84+"], [":89:", "89.gif", "TI-89"], [":89ti:", "89ti.gif", "TI-89 Titanium"], [":!:", "icon_exclaim.gif", "Exclamation"], [":?:", "icon_question.gif", "Question"], [":arrow:", "icon_arrow.gif", "Arrow"], [":altevil:", "icon_evil.gif", "Evil 2"], [":mrgreen:", "icon_mrgreen.gif", "Mr Green"], [":redface:", "icon_redface.gif", "Red Face"], [":altsurprised:", "icon_surprised.gif", "Surprised 2"], [":shock:", "shock.gif", "Shock 2"], [":idea:", "icon_idea.gif", "Idea"], [":thumbsup:", "goodidea.gif", "Thumbs Up"], [":thumbsdown:", "badidea.gif", "Thumbs Down"], [":dcs7:", "dcs7_chevron.png", "Doors CS 7"], ["j/k", "jksmilie.gif", "Just Kidding"], [":calc:", "calc.gif", "Graphing Calculator"], [":84pce:", "84pce.gif", "TI-84+ CE"], ["owo", "owo.png", "Smiling Cat"]];

	var emojiCon = "<tbody style='display: table-header-group;'><tr align='center'><td colspan='4'><b>Emoticons</b></td>";
	emojisArr.forEach(function (index, i) {
		if (!(i % 4)) {
			emojiCon += "</tr>";
			if (i === 20) emojiCon += "</tbody><tbody id='moreEmoji' class='hiddenEmoji'>";
			emojiCon += "<tr align='center'>";
		}
		emojiCon += "<td width='25%'><a href=\"javascript:emoticon('" + index[0] + "')\"><img src='images/smiles/" + index[1] + "' alt='" + index[2] + "' title='" + index[2] + "'></a></td>";
	});
	emojiCon += "</tbody><tr align='center'><td colspan='4'><a class='cursor-pointer' onclick='document.getElementById(\"moreEmoji\").classList.toggle(\"hiddenEmoji\"); this.textContent = this.textContent.replace(/(more|less)/g,$1=>$1===\"more\"?\"less\":\"more\");'>View more emoticons</a></td></tr>";
	emojiTbl.style = "margin: auto; width: 160px";
	emojiTbl.innerHTML = emojiCon;
	//Replace old emoji table
	const loc = document.querySelector("#page_content_parent > form > div.mainbody > div > table > tbody");
	loc.querySelector("tr:nth-child(3) > td.row1").firstElementChild.replaceWith(emojiTbl);
	loc.querySelector("tr:nth-child(3) > td.row2 > div:nth-child(5)").style.marginBottom = "10px";
    	let bodyBlock = document.querySelector("#page_content_parent > div.mainbody > div > iframe");
    	if (bodyBlock) {
        	bodyBlock.width = "99%";
    	}
	//Add placeholder texts
	document.getElementsByName("subject")[0].placeholder = "Subject";
	document.getElementsByName("message")[0].placeholder = "Message Body";

	//Remove some useless junk
	loc.querySelector("tr:nth-child(2) > td.row1").textContent = "";
	loc.querySelector("tr:nth-child(4) > td.row1").innerHTML = "";
});

new Tweak("Add copy button to code blocks.", /cemetech\.net\/forum\//, () => {
	const temp = document.createElement("textarea");
	temp.style = "position: absolute; opacity: 0;";
	document.body.appendChild(temp);

	Array.from(document.getElementsByClassName("code")).forEach((codeBlock) => {
		const button = document.createElement("button");
		button.innerText = "Copy";

		debugger;
		// needs to be addEventListener instead of .onclick because of spooky document.execCommand
		button.addEventListener("click", () => {
			const contents = codeBlock.getElementsByTagName("code")[0].innerText.replace(/\u00A0 \u00A0/g, "\t"); // wtf- 3 spaces?! I have officially seen everything.

			temp.value = contents;
			temp.select();

			document.execCommand("copy");

			button.innerText = "Copied!";
			setTimeout(() => button.innerText = "Copy", 2000);
		});

		codeBlock.insertBefore(button, codeBlock.children[0]);
	});
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

// also stolen from womp.
new GlobalTweak("Add color picker.", /cemetech\.net\/forum\/posting\.php/, () => {
	const i = document.createElement("input");
    i.type = "color";
    i.setAttribute("onchange", "bbfontstyle('[color=' + this.value + ']', '[/color]');");
    i.setAttribute("onmouseover", "helpline('s')");
    document.querySelector(".code-buttons:first-child").appendChild(i);
});

new GlobalTweak("Add H1-H6 selector.", /cemetech\.net\/forum\/posting\.php/, () => {
	window["he_help"] = "Header style: [h1]text[/h1]";
	var headerContainer = document.createElement('span');
	headerContainer.innerHTML = "Header style: <select name='addbbcode42' onchange=\"bbfontstyle('[h' + this.selectedIndex + ']', '[/h' + this.selectedIndex + ']');this.selectedIndex=0;\" onmouseover=\"helpline(\'he\')\"><option value='Default' selected>Default</option><option value='h1'>h1</option><option value='h2'>h2</option><option value='h3'>h3</option><option value='h4'>h4</option><option value='h5'>h5</option><option value='h6'>h6</option></select>";
	//Insert it before 'Close Tags'
	DOMInsertLoc = document.querySelector(".code-buttons:nth-of-type(2)");
	DOMInsertLoc.insertBefore(headerContainer, DOMInsertLoc.lastChild.previousSibling);
});

// needs to run instantly
(() => {
	const runtime = chrome === undefined ? (browser === undefined ? undefined : browser.extension) : chrome.runtime;

	if (runtime) {
		const script = document.createElement("script");
		script.src = runtime.getURL("sax.js");
		script.charset = "utf-8";
		document.body.appendChild(script);
	}
})();

Tweak.execute(window.location.href);
