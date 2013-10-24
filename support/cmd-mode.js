CodeMirror.defineMode('cmd', function(config) {
	var stream, state;

	function match() {
		if (stream.sol()) {
			state.matched = false;
			if (stream.eatSpace()) return;
		}
		return matchPrompt();
	}

	function matchPrompt() {
		if (!state.matched && stream.eat('$')) {
			return 'prompt'
		}
		stream.skipToEnd();
		state.token = match;
	}

	return {
		startState: function() {
			return { token: match };
		},

		token: function(_stream, _state) {
			stream = _stream;
			state = _state;
			return state.token();
		}
	};
});