// also stolen from womp https://github.com/mrwompwomp/Cemetech-Userstyle/blob/37aca9ebc1112f660abfa33eaf086a45e14b973f/wompScript.js#L16-L22
new Tweak("Make online users clickable.", /.*/, () => {
	const sidebar = document.querySelectorAll("p.sidebar__section-body")[0];
	if (sidebar.parentElement.childElementCount == 2) {
			const parts = sidebar.textContent.split("Members:");
			const before = parts[0];
			const names = parts[1].trim().slice(0, -1).split(", ");

			const links = names.map(name => {
				return "<a href='https://www.cemetech.net/users/" + encodeURIComponent(name).replace(/'/g, '%27') + "'>" + escapeHtml(name) + "</a>";
			});

			sidebar.innerHTML = before + "<br>Members: " + links.join(", ") + ".";
		} else {
		const parts = document.getElementsByClassName("commasep-list")[0];
		for (let i = 1; i < parts.childElementCount + 1; i++) {
			const node = parts.childNodes[i].firstElementChild;
			const name = node.textContent;
			node.innerHTML = "<a href='https://www.cemetech.net/users/" + encodeURIComponent(name).replace(/'/g, '%27') + "'>" + escapeHtml(name) + "</a>";
		}
	}
});
