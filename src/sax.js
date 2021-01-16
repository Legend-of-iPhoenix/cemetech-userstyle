"use strict";

const Config = { 
	ROOM_JID: "sax-ng@conference.cemetech.net",
	CREDENTIALS_REFRESH_URL: "/forum/login.php", // URL to make a HEAD request to in order to refresh credentials.
	BOSH_SERVICE: "/xmpp/http-bind", // https://xmpp.org/extensions/xep-0124.html
	LINE_LIMIT: 30, // server-enforced max of 50
	AUTH_RETRY_LIMIT: 1,

	// element ids
	MESSAGES_PARENT: "ajaxinfobox",
	CHAT_INPUT: "saxtalk"
};

function escapeHtml(text) {
	function replaceTag(tag) {
		return {"&": "&amp;", "<": "&lt;", ">": "&gt;"}[tag] || tag;
	}
	
	return text.replace(/[&<>]/g, replaceTag);
}

/* Unescapes HTML entities in the unsafe input
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

class Sax {
	constructor() {
		this.connection = null;
		this.username = null;
		this.highlightPattern = null;

		this.authRetries = 0;

		this.jidMap = {};
	}

	authenticate() {
		if (this.authRetries >= Config.AUTH_RETRY_LIMIT) {
			this.consoleMessage("Error: Authentication failed");
		}
		// fetch api unfortunately has poor legacy browser support, and babel doesn't even make an attempt to transpile it.
		const req = new XMLHttpRequest();

		req.onload = () => {
			this.authRetries++;

			this.disconnect();
			this.connect()
		};

		req.open("HEAD", Config.CREDENTIALS_REFRESH_URL);
	}

	onConnect(status/*, error*/) {
		switch (status) {
			case Strophe.Status.CONNFAIL: {
				this.consoleMessage("Error: Connection failed: reload this page to retry");
				this.disconnect();

				return;
			}

			case Strophe.Status.DISCONNECTED: {
				this.consoleMessage("Error: Lost connection: reload this page to reconnect");
				this.disconnect();

				return;
			}

			case Strophe.Status.AUTHFAIL: {
				this.authenticate();

				return;
			}

			case Strophe.Status.CONNECTED: {
				this.connection.muc.join(Config.ROOM_JID, this.username, (stanza) => this.onMessage(stanza), (stanza) => this.onPresenceUpdate(stanza), undefined, null, {
					maxstanzas: Config.LINE_LIMIT
				});

				return;
			}
		}
	}

	getAuthCredentials() {
		// Pull out individual cookies we need for auth
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim().split("=", 2);
			if (cookie[0] === "phpbb_sid") {
				// We used to look at the phpbb_data cookie to find the UID, but nobody
				// knows where that value comes from so it was just added to the
				// template as a global.
				
				return {
					uid: window["sax_uid"],
					sid: cookie[1]
				};
			}
		}

		return null;
	}

	connect() {
		this.consoleMessage("Authenticating and loading backlog...");
		
		this.connection = new Strophe.Connection(Config.BOSH_SERVICE);

		const credentials = this.getAuthCredentials();
		if (credentials === null) {
			this.consoleMessage("Error: Failed to get credentials");
			return;
		}

		const {uid, sid} = credentials;
		const jid = uid + "@cemetech.net";

		if (window["sax_username"]) {
			this.username = window["sax_username"];
		} else {
			this.username = uid + "";
		}

		if (window["sax_highlight_pattern"]) {
			try {
				this.highlightPattern = new RegExp(window["sax_highlight_pattern"], 'i');
			} catch (e) {
				this.consoleMessage("Error: Invalid Highlight RegEx: " + e.message);
			}
		} else {
			const highlightString = this.username.slice(0, 4).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			this.highlightPattern = new RegExp("(^|[^\\w])" + highlightString, "i");
		}

		this.connection.connect(jid, sid, (status) => this.onConnect(status));
	}

	disconnect() {
		this.connection.disconnect();

		this.connection.reset();
		this.connection = null;
	}

	onPresenceUpdate(stanza/*, room*/) {
		const nickname = stanza.attributes["from"].value.split("/")[1];
		let jid = '';

		try {
			const item = stanza.childNodes[0].childNodes[0];
			jid = item.attributes["jid"].value;
		} catch (e) {
			console.warn("Received Invalid Presence " + stanza);
			return true;
		}

		this.jidMap[nickname] = jid.split('/')[0];

		return true;
	}

	onMessage(stanza/*, room*/) {
		const message = {
			timestamp: new Date(),
			fresh: true,
			text: stanza.getElementsByTagName("body")[0].textContent,
			from: stanza.attributes["from"].value.split("/").slice(1).join("/")
		};

		// I'm not convinced sendername is ever actually sent - iPhoenix
		
		const delay = stanza.getElementsByTagName("delay")[0];
		if (delay) {
			message.timestamp = new Date(delay.attributes["stamp"].value);
			message.fresh = false;
		}

		const error = stanza.getElementsByTagName("error")[0];
		if (error) {
			message.from = "ERROR";
			message.fresh = false;
			message.text = child.getElementsByTagName("text")[0].innerText;
		}

		this.displayMessage(message);

		return true; // or the stupid library deletes the handler
	}

	showHighlight(message) {
		if (message.fresh) {

		}
	}

	displayMessage(message) {
		if (!message.from) {
			// received message from anonymous sender
			return;
		}

		const textHTML = this.linkify(unescapeEntities(message.text));

		const parent = document.getElementById(Config.MESSAGES_PARENT);
		const line = document.createElement("li");
		line.classList.add("sax-message");

		// todo: handle /me & highlights here
		const timestamp = document.createElement("span");
		timestamp.classList.add("sax-timestamp");
		timestamp.innerText = message.timestamp.toLocaleTimeString();

		const username = document.createElement("span");
		username.classList.add("sax-username");
		username.innerText = "[" + message.from + "]";

		username.title = this.jidMap[message.from] || "Unknown JID???";

		const text = document.createElement("span");
		text.classList.add("sax-message");
		text.innerHTML = textHTML;

		// .append would be nice here but IE doesn't support it, naturally.
		line.appendChild(timestamp);
		line.appendChild(document.createTextNode(" "));
		line.appendChild(username);
		line.appendChild(document.createTextNode(" "));
		line.appendChild(text);

		if (this.highlightPattern && this.highlightPattern.test(message.text.toLowerCase()) && message.fresh) {
			line.classList.add("saxhighlight");
			this.showHighlight(message);
		}

		parent.insertBefore(line, parent.firstChild);
		if (parent.childElementCount > Config.LINE_LIMIT) {
			parent.removeChild(parent.lastChild);
		}
	}

	consoleMessage(text) {
		const message = {
			timestamp: new Date(),
			fresh: false,
			text: escapeHtml(text),
			from: "<console>"
		};

		this.displayMessage(message);
	}

	linkify(text) {
		// this is like, extremely questionable
		const URL_REGEX = "https?:\\/\\/[A-Za-z0-9\\-\\.+_~:/?#\\[\\]@!$&'()*+,;%=]+";
		const pattern = new RegExp("\\[.+?]\\(\\s*" + URL_REGEX + "?\\s*\\)|" + URL_REGEX, "g");
		const namedUrlPattern = new RegExp("\\[(.+?)]\\(\\s*(" + URL_REGEX + "?)\\s*\\)", '');
		
		const matches = text.match(pattern);

		if (matches === null) {
			return escapeHtml(text);
		}

		let result = "";
		text.split(pattern).forEach((section, index) => {
			result += escapeHtml(section);

			const match = matches[index];
			if (match === undefined) return;


			let title = match;
			let url = match;

			const namedParts = match.match(namedUrlPattern);
			if (namedParts !== null) {
				url = namedParts[2];
				title = escapeHtml(namedParts[1]);
			}

			result += '<a href="' + url + '">' + title + '</a>';
		});

		return result;
	}

	handleCommand(text) {
		const command = text.split(/\s+/)[0];
		// sanity check
		if (command[0] !== "/") {
			return;
		}

		const commandData = Sax.commands[command.substring(1)];

		if (commandData === undefined || commandData.handler === null) {
			this.connection.muc.groupchat(Config.ROOM_JID, text);
		} else {
			commandData.handler(this, this.username, text);
		}
	}

	// must be this name exactly for the page to work right
	do_form_submit(event) {
		// don't submit the form
		event.stopPropagation();
		event.preventDefault();

		const input = document.getElementById(Config.CHAT_INPUT);
		const text = input.value.trim();

		if (text !== null && text !== "") {
			if (text[0] === "/") {
				this.handleCommand(text);
			} else {
				this.connection.muc.groupchat(Config.ROOM_JID, text);
			}
			input.value = "";
		}
	}

	/**
	 * Handler takes 3 params: client, username and text
	 * The username is not sanitized, but the text is sanitized and has been linkified. The text still contains the command.
	 */
	static addCommand(name, usage, handler) {
		Sax.commands[name] = {
			usage: usage,
			handler: handler
		};
	}
}

Sax.commands = {
	"me": {
		usage: "/me <message>: perform <message> as an action",
		handler: null // the /me command is special because it passes through to saxjax
	}
};


Sax.addCommand("help", "/help to get a list of commands, or /help <command> to get information on any single command", (client, username, message) => {
	const command = message.split(/\s+/)[1];
	if (command && Sax.commands[command]) {
		const usage = Sax.commands[command].usage;

		client.consoleMessage("Usage for /" + command + ": " + usage);
	} else {
		if (command) {
			client.consoleMessage("Command not found.");
		} else {
			const commands = Object.keys(Sax.commands).map(command => "/" + command);
			client.consoleMessage("Commands: " + commands.join(", "));
		}
	}
});

// todo: use roster updates so that this command works better
Sax.addCommand("jid", "/jid <username> to obtain the JID of a user if they have chatted recently.", (client, username, message) => {
	const name = message.substring(5) // "/jid ".length

	const jid = client.jidMap[name];

	if (jid !== undefined) {
		client.consoleMessage(name + " has a JID of " + jid);
	} else {
		client.consoleMessage("Could not obtain JID from provided username: " + name);
	}
});

Sax.addCommand("ban", "/ban [-stealth] <username or JID> to ban a user.", (client, username, message) => {
	const usernameOrJID = message.replace("-stealth", '').substring(5).trim(); // 5 === "/ban ".length

	let jid = '';
	if (/\d+@cemetech\.net/.test(usernameOrJID)) { // it's a JID
		jid = usernameOrJID;
	} else {
		jid = client.jidMap[username];
	}

	if (jid !== undefined && jid !== '') {
		// todo: ban reasons? I think that allowing /ban <username> is more useful than providing a reason for the ban in the ban message itself.
		client.connection.muc.ban(Config.ROOM_JID, jid, null, () => {
			// success
			if (message.indexOf("-stealth") === -1) {
				client.connection.muc.groupchat("/me banned " + jid);
			} else {
				client.consoleMessage("Sucessfully banned " + jid + ". (You applied the -stealth flag, so this message is not visible to anyone else.)");
			}
		},
		(stanza) => {
			// failure
			client.consoleMessage("Could not ban " + jid +": " + stanza.querySelector('text').textContent);
		});
	} else {
		client.consoleMessage("Invalid JID or username (or JID not found): " + usernameOrJID);
	}
});

Sax.addCommand("unban", "/unban [-stealth] <username or JID> to unban a user.", (client, username, message) => {
	const usernameOrJID = message.replace("-stealth", '').substring(7).trim(); // 7 === "/unban ".length

	let jid = '';
	if (/\d+@cemetech\.net/.test(usernameOrJID)) { // it's a JID
		jid = usernameOrJID;
	} else {
		jid = client.jidMap[username];
	}

	if (jid !== undefined && jid !== '') {
		client.connection.muc.revoke(Config.ROOM_JID, jid, "Unbanning", () => {
			// success
			if (message.indexOf("-stealth") === -1) {
				client.connection.muc.groupchat("/me unbanned " + jid);
			} else {
				client.consoleMessage("Sucessfully unbanned " + jid + ". (You applied the -stealth flag, so this message is not visible to anyone else.)");
			}
		},
		(stanza) => {
			// failure
			client.consoleMessage("Could not unban " + jid +": " + stanza.querySelector('text').textContent);
		});
	} else {
		client.consoleMessage("Invalid JID or username (or JID not found): " + usernameOrJID);
	}
});

Sax.addCommand("banlist", "/banlist to get the list of active bans", (client, username, message) => {
	const query = new Strophe.Builder("iq", {
		"to": Config.ROOM_JID,
		"type": "get"
	}).c("query", {
		"xmlns": "http://jabber.org/protocol/muc#admin"
	}).c("item", {
		"affiliation": "outcast"
	});

	client.connection.sendIQ(query, () => {
		// success
		const jids = Array.from(stanza.querySelectorAll("item")).map(item => item.attributes["jid"].value);

		client.consoleMessage(jids.length + " ban(s) active: [" + jids.join(", ") + "]");
	}, () => {
		// failure
		client.consoleMessage("Could not get banlist: " + stanza.querySelector('text').textContent);
	});
});

Sax.addCommand("op", "/op <username or JID> to grant admin permissions to a user", (client, username, message) => {
	const usernameOrJID = message.substring(4).trim(); // 4 === "/op ".length

	let jid = '';
	if (/\d+@cemetech\.net/.test(usernameOrJID)) { // it's a JID
		jid = usernameOrJID;
	} else {
		jid = client.jidMap[username];
	}

	if (jid !== undefined && jid !== '') {
		connection.muc.owner(Config.ROOM_JID, jid, "op", () => {
			// success
			connection.muc.groupchat(sax_room, "/me granted ops to " + jid);
		}, () => {
			// failure
			client.consoleMessage("Could not op: " + stanza.querySelector('text').textContent);
		});
	} else {
		client.consoleMessage("Invalid JID or username (or JID not found): " + usernameOrJID);
	}
});

Sax.addCommand("deop", "/deop <username or JID> to revoke admin permissions from a user", (client, username, message) => {
	const usernameOrJID = message.substring(6).trim(); // 6 === "/deop ".length

	let jid = '';
	if (/\d+@cemetech\.net/.test(usernameOrJID)) { // it's a JID
		jid = usernameOrJID;
	} else {
		jid = client.jidMap[username];
	}

	if (jid !== undefined && jid !== '') {
		connection.muc.owner(Config.ROOM_JID, jid, "op", () => {
			// success
			connection.muc.groupchat(sax_room, "/me revoked ops from " + jid);
		}, () => {
			// failure
			client.consoleMessage("Could not deop: " + stanza.querySelector('text').textContent);
		});
	} else {
		client.consoleMessage("Invalid JID or username (or JID not found): " + usernameOrJID);
	}
});

Sax.addCommand("oplist", "/oplist to get the list of admins", (client, username, message) => {
	const query = new Strophe.Builder("iq", {
		"to": Config.ROOM_JID,
		"type": "get"
	}).c("query", {
		"xmlns": "http://jabber.org/protocol/muc#admin"
	}).c("item", {
		"affiliation": "owner"
	});

	client.connection.sendIQ(query, () => {
		// success
		const jids = Array.from(stanza.querySelectorAll("item")).map(item => item.attributes["jid"].value);

		client.consoleMessage(jids.length + " op(s) active: [" + jids.join(", ") + "]");
	}, () => {
		// failure
		client.consoleMessage("Could not get oplist: " + stanza.querySelector('text').textContent);
	});
});

document.addEventListener("DOMContentLoaded", () => {
	window["SAX"] = new Sax();
	window["SAX"].connect();
});