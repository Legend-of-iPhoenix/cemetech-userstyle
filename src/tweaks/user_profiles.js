new Tweak("Add karma count to user profiles", /cemetech\.net\/forum\/profile\.php/, () => {
	const httpRequest = new XMLHttpRequest();

	if (!httpRequest) return;

	const username = document.querySelector(".profile_avatar>img").alt.replaceAll(/ /g,"");

	httpRequest.onreadystatechange = () => {
		if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
			const score = JSON.parse(httpRequest.responseText).score;
			const separator = document.createTextNode(" | ");
			const link = document.createElement("a");
			const karmaText = document.createTextNode(score + " karma");
			link.appendChild(karmaText);
			link.href = "https://decbot.cemetech.net/scores/" + encodeURIComponent(username);
			const elem = document.querySelectorAll(".profile_brief>.gen")[3];
			elem.appendChild(separator);
			elem.appendChild(link);
		}
	};

	httpRequest.open('GET', 'https://decbot.cemetech.net/api/scores/' + encodeURIComponent(username));
	httpRequest.send();
});