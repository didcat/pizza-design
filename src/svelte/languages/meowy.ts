import type rust from 'svelte-highlight/languages/rust';

type Grammar = ReturnType<typeof rust.register>;
type Mode = Grammar['contains'][number];
type Callback = NonNullable<Mode['on:begin']>;

const register = (): Grammar => {
	const doc: Mode = {
		scope: 'comment',
		begin: /#(!?)(\|+)/,
		end: /\|+!?#/,
		'on:begin': (match, res) => {
			res.data.close = `${match[2]}${match[1]}#`;
		},
		'on:end': ((match, res) => {
			if (match[0] !== res.data.close) res.ignoreMatch();
		}) satisfies Callback,
	};
	const text: Mode = { scope: 'string', begin: /"/, end: /"/, contains: [{ begin: /\\[\s\S]/ }] };
	const expr: Mode = { scope: 'subst', begin: /\{/, end: /\}/, contains: [] };
	const modes: Mode[] = [
		doc,
		{ scope: 'comment', begin: /#/, end: /#/ },
		{ scope: 'meta', begin: /@"/, end: /"/, contains: [{ begin: /\\[\s\S]/ }] },
		text,
		{
			scope: 'number',
			match: /\b(?:0[xX][\da-fA-F](?:_?[\da-fA-F])*|0[bB][01](?:_?[01])*|\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?)\b/,
		},
		{ scope: 'symbol', match: /'[A-Za-z_][A-Za-z0-9_]*/ },
		{ scope: 'attr', match: /\b[A-Za-z_][A-Za-z0-9_]*(?=\s*:(?!:))/ },
		{ scope: 'title.function', match: /\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/ },
		{ match: /\b[A-Za-z_][A-Za-z0-9_]*\b/, relevance: 0 },
		{ scope: 'operator', match: /->|:=|&&|\|\||==|!=|<=|>=|&!|>>|<<|[-+*/%=<>!~^&|:@]/ },
		{ scope: 'punctuation', match: /[{}()[\],;.]/ },
	];
	text.contains!.push(expr);
	expr.contains = [{ begin: /\{/, end: /\}/, contains: ['self', ...modes] }, ...modes];
	return { name: 'meowy', aliases: ['mwy'], contains: modes };
};

export default { name: 'meowy', register };
