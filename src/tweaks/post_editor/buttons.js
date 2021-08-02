function addEditorButton(name, accessKey, style, helpMessage) {
	const tagname = name.toLowerCase();

	// this code interfaces with at least three layers of garbage code, why not add another one on top.
	new GlobalTweak(`Add ${name} button.`, /cemetech\.net\/forum\/posting\.php/, Function(`
		/* HEY! this is generated code */

		window["${name}_help"] = "${helpMessage.replace(/"/g, '\\"') + `: [${tagname}]text[/${tagname}] (alt+${accessKey})`}";

		const position = bbtags.length;
		bbtags.push("[${tagname}]", "[/${tagname}]");

		const container = document.createElement('span');
		container.classList = "genmed code-button-wrap";

		const button = document.createElement('input');
		button.type = "button";
		button.classList = "button";
		button.accessKey = "${accessKey}";
		button.style = "${style.replace(/"/g, '\\"')}";
		button.onclick = () => bbstyle(position);
		button.onmouseover = () => helpline('${name}');

		button.value = "${name}";

		container.appendChild(button);
		document.querySelector(".code-buttons:first-child").appendChild(container);
	`));
}

addEditorButton("Strike", "t", "text-decoration: line-through;", "Strikethrough text");
addEditorButton("Mono", "m", "font-family: monospace;", "Monospaced text (inline code)");
addEditorButton("Center", "j", "text-align: center;", "Centered content");

new GlobalTweak("Add hr button", /cemetech\.net\/forum\/posting\.php/, () => {
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

new GlobalTweak("Add color picker.", /cemetech\.net\/forum\/posting\.php/, () => {
	const i = document.createElement("input");
	i.type = "color";
	i.setAttribute("onchange", "bbfontstyle('[color=' + this.value + ']', '[/color]');");
	i.setAttribute("onmouseover", "helpline('s')");
	document.getElementsByName("addbbcode19")[0].parentElement.appendChild(i);
});

new GlobalTweak("Add H1-H6 selector.", /cemetech\.net\/forum\/posting\.php/, () => {
	window["he_help"] = "Header style: [h1]text[/h1]";
	const headerContainer = document.createElement('span');
	headerContainer.innerHTML = "Header style: <select name='addbbcode42' onchange=\"bbfontstyle('[h' + this.selectedIndex + ']', '[/h' + this.selectedIndex + ']');this.selectedIndex=0;\" onmouseover=\"helpline(\'he\')\"><option value='Default' selected>Default</option><option value='h1'>h1</option><option value='h2'>h2</option><option value='h3'>h3</option><option value='h4'>h4</option><option value='h5'>h5</option><option value='h6'>h6</option></select>";
	//Insert it before 'Close Tags'
	DOMInsertLoc = document.querySelector(".code-buttons:nth-of-type(2)");
	DOMInsertLoc.insertBefore(headerContainer, DOMInsertLoc.lastChild.previousSibling);
});

new GlobalTweak("Fix console error with youtube button.", /cemetech\.net\/forum\/posting\.php/, () => {
	window["y_help"] = "Youtube video: [youtube]Youtube URL[/youtube] (alt+y)";
});

new Tweak("Redo Emoji Table", /cemetech\.net\/forum\/posting\.php/, () => {
	//new emoji table
	const emojiTbl = document.createElement("table");

	const emojisArr = [[":)", "icon_smile.gif", "Smile"], [":(", "icon_sad.gif", "Sad"], [":D", "icon_biggrin.gif", "Very Happy"], [":o", "icon_eek.gif", "Surprised"], [":?", "icon_confused.gif", "Confused"], ["8)", "icon_cool.gif", "Cool"], [":lol:", "icon_lol.gif", "Laughing"], [":x", "icon_mad.gif", "Mad"], [":P", "icon_razz.gif", "Razz"], [":evil:", "icon_twisted.gif", "Evil or Very Mad"], [":roll:", "icon_rolleyes.gif", "Rolling Eyes"], [":wink:", "icon_wink.gif", "Wink"], [":wacko:", "wacko.gif", "Wacko"], [":|", "icon_neutral.gif", "Neutral"], [":sleep:", "sleep.gif", "Sleep"], [":blink:", "blink.gif", "Blink"], [":cry:", "crying.gif", "Crying"], [":dry:", "dry.gif", "Dry"], [":unsure:", "unsure.gif", "Unsure"], ["@_@", "icon_shock.gif", "Shock"], [":73:", "73.gif", "TI-73"], [":83p:", "83p.gif", "TI-83+"], [":86:", "86.gif", "TI-86"], [":83pse:", "83pse.gif", "TI-83+ SE"], [":84pse:", "84pse.gif", "TI-84+ SE"], [":84p:", "84p.gif", "TI-84+"], [":89:", "89.gif", "TI-89"], [":89ti:", "89ti.gif", "TI-89 Titanium"], [":!:", "icon_exclaim.gif", "Exclamation"], [":?:", "icon_question.gif", "Question"], [":arrow:", "icon_arrow.gif", "Arrow"], [":altevil:", "icon_evil.gif", "Evil 2"], [":mrgreen:", "icon_mrgreen.gif", "Mr Green"], [":redface:", "icon_redface.gif", "Red Face"], [":altsurprised:", "icon_surprised.gif", "Surprised 2"], [":shock:", "shock.gif", "Shock 2"], [":idea:", "icon_idea.gif", "Idea"], [":thumbsup:", "goodidea.gif", "Thumbs Up"], [":thumbsdown:", "badidea.gif", "Thumbs Down"], [":dcs7:", "dcs7_chevron.png", "Doors CS 7"], ["j/k", "jksmilie.gif", "Just Kidding"], [":calc:", "calc.gif", "Graphing Calculator"], [":84pce:", "84pce.gif", "TI-84+ CE"], ["owo", "owo.png", "Smiling Cat"]];

	let emojiCon = "<tbody style='display: table-header-group;'><tr align='center'><td colspan='4'><b>Emoticons</b></td>";
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
	const bodyBlock = document.querySelector("#page_content_parent > div.mainbody > div > iframe");
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
