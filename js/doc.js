!function () {

var element = {};

element.paypalLink = document.getElementById('paypalLink');
if (element.paypalLink) {
	element.paypalInfo = document.getElementById('paypalInfo');
	element.paypalLink.addEventListener('click', function (ev) {
		ev.preventDefault();
		element.paypalInfo.classList.toggle('active');
	}, false);
}

element.editor = document.getElementById('editor');
if (element.editor) {
	element.editorSwitch = editor.getElementsByClassName('Editor-switch')[0];
	element.editorSwitch.addEventListener('click', function (ev) {
		element.editorSwitch.classList.toggle('switched');
		element.editor.classList.toggle('css');
	}, false);

	element.editorInput = editor.querySelector('.Editor-input>textarea');
	var inputEditor = CodeMirror.fromTextArea(element.editorInput, {
		mode: 'roole',
		theme: 'custom',
		tabSize: 2,
		indentWithTabs: true,
		autofocus: true,
		lineWrapping: true,
		scrollPastEnd: true
	});

	element.editorOutput = editor.getElementsByClassName('Editor-output')[0];
	var outputEditor = CodeMirror(element.editorOutput, {
		mode: 'css',
		theme: 'custom',
		readOnly: 'nocursor',
		tabSize: 2
	});

	element.editorErr = div = document.createElement('div');
	element.editorErr.className = 'Editor-error';
	var editorTimer, editorErrTimer, editorErred;

	inputEditor.on('change', function () {
		hideEditorInputError();
		clearTimeout(editorTimer);
		editorTimer = setTimeout(compileEditorInput, 400);
	});

	compileEditorInput();
}

enquire.register('(min-width: 768px)', {
	deferSetup: true,

	setup: function () {
		element.global = document.getElementById('global');
		element.doc = document.getElementById('doc');
		if (element.doc) {
			var bookmarks = doc.getElementsByClassName('Bookmark');
			var offsets = [];
			for (var i = 0, len = bookmarks.length; i < len; ++i) {
				var bookmark = bookmarks[i];
				var offset = bookmark.getBoundingClientRect().top + window.pageYOffset;
				offsets.push(offset);
			}
			element.docOffsets = offsets;

			var headings = document.getElementsByClassName('Doc-heading');
			element.docHeadings = [].slice.call(headings, 0);

			element.toc = document.getElementById('toc');
			element.tocItems = element.toc.getElementsByTagName('li');
			element.tocPrevItem = element.toc.getElementsByClassName('active')[0];
		}

		element.dropdownNav = document.getElementById('dropdownNav');
		if (element.dropdownNav) {
			element.dropdownNavTitle = element.dropdownNav.getElementsByClassName('Nav-title')[0];
		}
	},

	match: function () {
		if (element.global) {
			window.addEventListener('scroll', decorateGlobal, false);
		}

		if (element.doc) {
			element.docHeadings.forEach(function (heading) {
				heading.addEventListener('click', activeDocSection, false)
			});
			window.addEventListener('scroll', fixToc, false);
			window.addEventListener('scroll', highlightToc, false);
		}

		if (element.dropdownNavTitle) {
			element.dropdownNavTitle.addEventListener('click', expandNavDropdown, false);
		}
	},

	unmatch: function () {
		if (element.global) {
			window.removeEventListener('scroll', decorateGlobal, false);
		}

		if (element.doc) {
			element.docHeadings.forEach(function (heading) {
				heading.removeEventListener('click', activeDocSection, false)
			});
			window.removeEventListener('scroll', fixToc, false);
			window.removeEventListener('scroll', highlightToc, false);
		}

		if (element.dropdownNavTitle) {
			element.dropdownNavTitle.removeEventListener('click', expandNavDropdown, false);
		}
	}
});

function decorateGlobal() {
	if (window.pageYOffset > 5) element.global.classList.add('em');
	else element.global.classList.remove('em');
}

function activeDocSection() {
	this.parentNode.classList.toggle('active');
}

function fixToc() {
	if (window.pageYOffset > 165) element.toc.classList.add('fixed');
	else element.toc.classList.remove('fixed');
}

function highlightToc() {
	for (var i = element.docOffsets.length - 1; i >= 0; --i) {
		if (window.pageYOffset >= element.docOffsets[i]) {
			var current = element.tocItems[i];
			if (current === element.tocPrevItem) return;
			element.tocPrevItem.classList.remove('active');
			current.classList.add('active');
			element.tocPrevItem = current;
			return;
		}
	}
}

function expandNavDropdown(ev) {
	ev.preventDefault();
	element.dropdownNav.classList.toggle('expand');
}

function hideEditorInputError() {
	if (!editorErred) return;
	clearTimeout(editorErrTimer);
	if (element.editorErr.parentNode) {
		element.editorErr.parentNode.removeChild(element.editorErr);
	}
}

function compileEditorInput() {
	var text = inputEditor.getValue();
	roole.compile(text, function (err, css) {
		if (err) {
			editorErred = true;
			editorErrTimer = setTimeout(function () {
				element.editorErr.textContent = err.message;
				var pos = { line: err.loc.line - 1, ch: err.loc.column - 1 };
				inputEditor.addWidget(pos, element.editorErr);
			}, 2000);
			return;
		}
		editorErred = false;
		outputEditor.setValue(css);
	});
}

}();