class Tweak {
	/**
	 * Creates and registers a tweak.
	 *
	 * @public
	 * @param {string} name The unique human-readable name of this tweak.
	 * @param {RegExp} whatPages A regular expression to match the URLs of the pages that will have this tweak applied.
	 * @param {function} callback The function to be executed after the page has loaded.
	 */
	constructor(name, whatPages, callback) {
		this.name = name;
		this.whatPages = whatPages;

		this.callback = callback;

		Tweak.register(this);
	}

	/**
	 * @protected
	 * @param {string} url The url to check if the tweak should be executed.
	 */
	applyTo(url) {
		if (this.whatPages.test(url)) {
			this.callback();
		}
	}

	/**
	 * Registers a Tweak. Tweaks are executed in the order they are registered.
	 * 
	 * @private
	 * @param {Tweak} tweak The tweak to register.
	 */
	static register(tweak) {
		Tweak.tweaks.push(tweak)
	}

	/**
	 * Executes all of the Tweaks that have been registered. Called at the end of userstyle.js
	 *
	 * @public
	 * @param {string} url The url to check from.
	 */
	static execute(url) {
		Tweak.tweaks.forEach(tweak => {
			tweak.applyTo(url);
		});
	}
}

Tweak.tweaks = [];

class GlobalTweak extends Tweak {
	/**
	 * @protected
	 * @param {string} url The url to check if the tweak should be executed.
	 */
	applyTo(url) {
		if (this.whatPages.test(url)) {
			const script = document.createElement("script");

			const source = `/* injected by userstyle: ${this.name} */ (${this.callback.toString()})()`;

			script.innerHTML = source;
			document.body.appendChild(script);
		}
	}
}

// make sure this is always the line one in the file for future maintainers.
console.log("Cemetech Userstyles v3.1.1 by _iPhoenix_ and contributors loaded.")
