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