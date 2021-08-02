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

new Tweak("Add copy button to code blocks.", /cemetech\.net\/forum\//, () => {
	const temp = document.createElement("textarea");
	temp.style = "position: absolute; opacity: 0;";
	document.body.appendChild(temp);

	Array.from(document.getElementsByClassName("code")).forEach((codeBlock) => {
		const button = document.createElement("button");
		button.innerText = "Copy";

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
