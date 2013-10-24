CodeMirror.defineMode('roole', function() {
	var stream, state;

	function matchRule() {
		if (stream.eat('}')) return 'blank';

		var style = matchWS()
			|| matchAssignment()
			|| matchAtRule()
			|| matchProperty();

		if (!style) {
			var string = stream.string.slice(stream.column());
			if (/\{/.test(string) || /,\s*$/.test(string)) {
				state.tokenize.push(matchSelectorUntilOpenBrace);
				style = matchSelectorUntilOpenBrace();
			} else {
				style = matchExpression();
			}
		}

		return style;
	}

	function matchWS() {
		if (stream.eatSpace()) return 'blank';
		return matchComment();
	}

	function matchComment() {
		if (stream.match('//')) {
			stream.skipToEnd();
			return 'comment';
		}

		if (stream.match(/\/\*/)) {
			state.tokenize.push(matchInnerComment);
			return 'comment';
		}
	}

	function matchInnerComment() {
		if (stream.match(/^[\s\S]*?\*\//)) {
			state.tokenize.pop();
			return 'comment';
		}

		stream.skipToEnd();
		return 'comment';
	}

	function matchAssignment() {
		var style = matchVariable();
		if (style) {
			var string = stream.string.slice(stream.column());

			if (!/\[[^\]]+=/.test(string) && /[-+*\/?]?=/.test(string)) {
				state.tokenize.push(matchExpressionUntilSemiColon);
			}
			return style;
		}
	}

	function matchExpressionUntilSemiColon() {
		if (stream.match(';')) {
			state.tokenize.pop();
			return 'blank';
		}

		return matchExpression();
	}

	function matchExpressionUntilCloseBrace() {
		if (stream.eat('}')) {
			state.tokenize.pop();
			return 'blank';
		}

		return matchExpression()
	}

	function matchExpressionUntilOpenBrace() {
		if (stream.eat('{')) {
			state.tokenize.pop();
			return 'blank';
		}

		return matchExpression()
	}

	function matchExpressionUntilCloseParen() {
		if (stream.eat(')')) {
			state.tokenize.pop();
			return 'blank';
		}

		return matchExpression();
	}

	function matchExpression() {
		return matchCall()
			|| matchVariable()
			|| matchAtRule()
			|| matchString()
			|| matchKeyword()
			|| matchWS();
	}

	function matchCall() {
		var style = matchVariable();
		if (style) {
			if (stream.peek() === '(') state.tokenize.push(matchExpressionUntilCloseParen);
			return style;
		}
	}

	function matchVariable() {
		if (stream.match(/^\$[-\w]+/)) return 'variable';
	}

	function matchString() {
		if (stream.match(/^'(?:[^'\\]|\\[\s\S])*'/)) return 'string'

		if (stream.eat('"')) {
			state.tokenize.push(matchInnerString)
			return 'string';
		}
	}

	function matchInnerString() {
		if (stream.match(/^(?:[^\\"{$]+|\\[\s\S])+/)) return 'string';

		if (stream.eat('"')) {
			state.tokenize.pop()
			return 'string'
		}

		if (stream.eat('{')) {
			state.tokenize.push(matchExpressionUntilCloseBrace);
			return 'blank';
		}

		return matchVariable();
	}

	function matchAtRule() {
		if (!stream.eat('@')) return;

		if (stream.match(/^(return|import)/i)) {
			state.tokenize.push(matchExpressionUntilSemiColon);
			return 'at-rule';
		}

		if (stream.match(/^mixin/i)) {
			state.tokenize.push(matchSelectorUntilSemiColon);
			return 'at-rule';
		}

		stream.match(/^else\s*if/i) || stream.match(/[-\w]+/);
		state.tokenize.push(matchExpressionUntilOpenBrace);
		return 'at-rule';
	}

	function matchKeyword() {
		if (stream.match(/^[^-\w](by|is|isnt|and|or|in)(?![-_\d])\b/i)) return 'keyword';
	}

	function matchProperty() {
		var string = stream.string.slice(stream.column());
		if (/: /.test(string)) {
			state.tokenize.push(matchExpressionUntilSemiColon);
			var style = matchExpressionUntilSemiColon();
			if (!style) {
				stream.next();
				return 'blank';
			}
		}
	}

	function matchSelectorUntilSemiColon() {
		if (stream.match(';')) {
			state.tokenize.pop();
			return 'blank';
		}

		return matchSelector();
	}

	function matchSelectorUntilOpenBrace() {
		if (stream.match('{')) {
			state.tokenize.pop();
			return 'blank';
		}

		return matchSelector();
	}

	function matchSelector() {
		var style = matchExpression();
		if (style) return style;

		if (stream.eatWhile(/[#.\w-:()>+~\[\]&,=]/)) return 'selector';
	}

	return {
		startState: function() {
			return { tokenize: [matchRule] };
		},

		token: function(_stream, _state) {
			stream = _stream;
			state = _state;
			var tokenize = state.tokenize[state.tokenize.length - 1];
			var style = tokenize();
			if (style === undefined) stream.next();
			else if (style === 'blank') style = null;
			return style;
		}
	};
});