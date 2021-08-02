// this file is loaded last, after every tweak file.

// utilities

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
	const txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
}

function escapeHtml(text) {
	function replaceTag(tag) {
		return {"&": "&amp;", "<": "&lt;", ">": "&gt;"}[tag] || tag;
	}
	return text.replace(/[&<>]/g, replaceTag);
}


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

// make sure this is always the last line in the file for future maintainers.
console.log("Cemetech Userstyles v3.2.0 by _iPhoenix_ and contributors loaded.");