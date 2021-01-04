const COLUMN_COLLAPSE_MIN_WIDTH = 45;
// casually stolen from jquery
function getOffset(element) {
    if (!element.getClientRects().length) {
      return {top: 0, left: 0};
    }

    const rect = element.getBoundingClientRect();
    const win = element.ownerDocument.defaultView;
    return {
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset
    };   
}

function width(element) {
	const rect = element.getBoundingClientRect();
	return rect.width;
}

const attachResizeListeners = (() => {
	let handlingMove = false;
	let handle = null;

	function beginMove(event) {
		if (handlingMove) return;

		handle = event.target;
		handle.parentElement.addEventListener("mousemove", handleMove);

		handlingMove = true;
	}

	function handleMove(event) {
		if (!handlingMove) return;

		let container = handle.parentElement;

		let element1 = handle.previousElementSibling;
		let element2 = handle.nextElementSibling;

		// cursor offset, relative to start of page
		let pageX = event.pageX;
		// cursor offset, relative to element1, shifted over so the cursor is half way into the handle.
		let cursorOffset = pageX - getOffset(element1).left - width(handle);

		let totalPercentage = parseFloat(element1.style.flexGrow) + parseFloat(element2.style.flexGrow);

		let totalWidth = width(element1) + width(element2);

		let element1_percentage = totalPercentage * cursorOffset / totalWidth;
		let element2_percentage = totalPercentage - element1_percentage;

		element1.style.flexGrow = element1_percentage.toString();

		if (!element1.classList.contains("collapsed") && cursorOffset < COLUMN_COLLAPSE_MIN_WIDTH) {
			element1.classList.add("collapsed");
			element2.style.flexGrow = totalPercentage;
		} else {
			if (element1.classList.contains("collapsed")) {
				if (cursorOffset > COLUMN_COLLAPSE_MIN_WIDTH) {
					element1.classList.remove("collapsed");
				}
			} else {
				if (element2.classList.contains("collapsed")) {
					if (totalWidth - cursorOffset > COLUMN_COLLAPSE_MIN_WIDTH) {
						element2.classList.remove("collapsed");
					}
				} else {
					if (totalWidth - cursorOffset < COLUMN_COLLAPSE_MIN_WIDTH) {
						element2.classList.add("collapsed");
						element1.style.flexGrow = totalPercentage;
					} else {
						element2.style.flexGrow =  element2_percentage.toString();
					}
				}
			}
		}

		event.preventDefault();	
	}

	function endMove() {
		handle.parentElement.removeEventListener("mousemove", handleMove)
		handlingMove = false;
	}

	return function() {
		const handles = document.querySelectorAll(".resize_handle");
		handles.forEach(handle => handle.addEventListener("mousedown", (event) => beginMove(event)));

		document.addEventListener("mouseup", () => handlingMove && endMove());
	}
})();