// TODO: something with emotes, "magic" [url]-less urls
function BBCodeToHTML(text) {
	const tags = {
		"b": {
			open: ()=>'<span style="font-weight: bold">',
			close: ()=>'</span>'
		},
		"i": {
			open: ()=>'<span style="font-style: italic">',
			close: ()=>'</span>'
		},
		"u": {
			open: ()=>'<span style="font-style: underline">',
			close: ()=>'</span>'
		},
		"strike": {
			open: ()=>'<strike>',
			close: ()=>'</strike>'
		},
		"color": {
			open: (option)=>{
				if (/\w+|#[0-9a-f]{3}|#[0-9a-f]{6}/i.test(option)) {
					return '<span style="color: ' + option + '">';
				}
				
				return '<span style="color: black">';
			},
			close: ()=>'</span>'
		},
		"size": {
			open: (option)=>{
				const size = parseInt(option, 10);

				if (isNaN(size) || size < 0 || size > 29 || option !== size.toString(10)) {
					throw new Error("Invalid font size of " + option);
				}

				return '<span style="font-size: ' + size + 'px; line-height: normal">';
			},
			close: ()=>'</span>'
		},
		"quote": {
			open: (option)=>{
				let quoteName = "Quote:";
				if (option) {
					quoteName = option.match(/"(.+)"/)[1] + " wrote:";
				}

				return `<div class="quote_name"><span class="genmed"><b>${quoteName}</b></span></div><div class="quote">`;
			},
			close: ()=>'</div>'
		},
		"code": {
			open: ()=>`<div class="code"><code class="prettyprint" style="font-family:Courier,'Courier New',sans-serif;">`,
			close: ()=>"</code></div>"
		},
		"hr": {
			open: ()=>"<hr>",
			singleton: true
		},
		"url": {
			open: (option)=>{
				if (option && /^https?:\/\/[A-Za-z0-9\-\.+_~:/?#\[\]@!$&'()*+,;%=]+$/.test(option)) {
					return '<a href="' + option + '">';
				} else {
					throw new Error("Using [url] without providing an option is literally pointless");
				}
			},
			close: ()=>"</a>"
		},
		"list": {
			open: (option)=>{
				switch (option) {
					case "a": return "<ol type='a'>";
					case "1": return "<ol>";
					default:  return "<ul>";
				}
			},
			close: ({name, option})=>{
				switch (option) {
					case "a":
					case "1": {
						return "</ol>";
					};
					default:  return "</ul>";
				}
			}
		},
		"*": {
			open: ()=>"<li>",
			singleton: true
		},
		"mono": {
			open: ()=>'<span style="font-family: monospace;">',
			close: ()=>'</span>'
		},
		"serif": {
			open: ()=>'<span style="font-family: serif;">',
			close: ()=>'</span>'
		},
		"sans": {
			open: ()=>'<span style="font-family: sans-serif;">',
			close: ()=>'</span>'
		},
		"sup": {
			open: ()=>'<sup>',
			close: ()=>'</sup>',
		},
		"sub": {
			open: ()=>'<sub>',
			close: ()=>'</sub>',
		},
		"center": {
			open: ()=>'<center>',
			close: ()=>'</center>',
		},
		"h1": {
			open: ()=>'<h1>',
			close: ()=>'</h1>',
		},
		"h2": {
			open: ()=>'<h2>',
			close: ()=>'</h2>',
		},
		"h3": {
			open: ()=>'<h3>',
			close: ()=>'</h3>',
		},
		"h4": {
			open: ()=>'<h4>',
			close: ()=>'</h4>',
		},
		"h5": {
			open: ()=>'<h5>',
			close: ()=>'</h5>',
		},
		"h6": {
			open: ()=>'<h6>',
			close: ()=>'</h6>',
		}
	}

	let stack = [];
	function parseTag(match, closing, tag, option) {
		const meta = tags[tag];
		if (meta === undefined) {
			return match;
		}

		if (closing) {
			if (meta.singleton) {
				throw new Error("Tag " + tag + " does not use a closing tag.");
			}

			const openingTag = stack.pop();
			if (tag != openingTag.name) {
				throw new Error("Unmatched opening " + openingTag.name + " tag/mismatched closing " + tag + " tag.");
			}

			return meta.close(openingTag);
		} else {
			if (!meta.singleton) {
				stack.push({
					name: tag,
					option: option
				});
			}

			return meta.open(option);
		}
	}

	// images are a special case because they're singletons in HTML but BBCode puts their parameter in their body, not as an option. This makes them difficult or impossible to parse safely with this parser.
	let result = text.replace(/</g, '&lt;').replace(/>/g, '&gt').replace(/\[(\/?)([\w*]+)(?:=([^"\n\]]+|".*?"))?]/g, parseTag).replace(/\[img\](https?:\/\/[A-Za-z0-9\-\.+_~:/?#\[\]@!$&'()*+,;%=]+)\[\/img\]/g, '<img src="$1">').replace(/\n/g, "<br />");

	if (stack.length) {
		throw new Error("Unclosed tag(s): " + stack.map(item=>item.name).join(", "));
	}

	return result;
}
