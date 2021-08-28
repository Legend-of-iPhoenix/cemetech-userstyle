//Restyle UTI pages (donated by womp)
new Tweak("Restyle UTI pages", /cemetech\.net\/projects\/uti/, () => {
	const style = document.createElement("style");
	style.innerHTML = `/* Userstyle: Recolor UTI pages */
	tr>th{
		border-bottom: 1px solid #254e6f !important;
	}
	section.sidebar__section,div.mainlowermiddle,div.mainheadmiddle,div.mainheadmiddle:after,div.mainheadmiddle:before,#hbot,.mainbody{
		background:#254e6f !important;
	}
	.sidebar__section,#hbot{
		border: 2px solid #19364d;x
	}
	a{
		color: #222;
	}
	a:hover{
		color:#34498B;
	}
	a.largetext:hover{
		color:#eee;
	}
	.maintitle:hover,.sidebar__section-body a:hover,.sidebar__section-header a:hover{
		color: white;
	}
	.navsearchinput{
		background:#34498B !important;
	}
	img[src*='lang_english'],.navsearchsubmit,.banner_container{
		filter:hue-rotate(194deg);
	}
	.sax-message a{
		background:#1c264a;
	}
	.sax-timestamp{
		color:#ddd;
	}`;
	document.body.append(style);
});