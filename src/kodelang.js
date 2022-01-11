const parser = require('./kodelang-parser')

let it
const generators = {
    Literal: l => JSON.stringify(l.v),
	출력: s=>`console.log(${expr(s.e)});`,
}

const dependencies = {
	addReadLine: `
		function $readLineSync() {
			const line = [];
			const buffer = Buffer.alloc(1);
			while (true) {
				const bytes = $fs.readSync(1, buffer, 0, 1, null);
				if (!bytes) break;
				if (buffer[0] === 10 || buffer[0] === 13) break;
				line.push(buffer[0]);
			}
			return Buffer.from(line).toString('utf-8');
		}
		`,
	fs: `const $fs = require('fs');`,
}

function varname(v) {
	return v.replace(/ /g, '')
}

function expr(e) {
	if (!(e.t in generators)) {
		console.log(e)
		throw new Error('Unknown statement type: '+e.t)
	}
	return generators[e.t](e)
}

function _groupBlocks(statements) {
	let ret = []
	let stmt
	while (stmt = statements.shift()) {
		if (stmt.t == 'BlankLine') return ret
		ret.push(stmt)
		if (stmt.t == 'If' || stmt.t == 'Else' || stmt.t == 'Loop' || stmt.t == 'FunctionDeclaration') {
			ret.push({
				t: 'Block',
				s: _groupBlocks(statements),
			})
		}
	}
	return ret
}
function groupBlocks(statements) {
	const ret = []
	while (statements.length !== 0) {
		_groupBlocks(statements).forEach(s => ret.push(s))
	}
	return ret
}

function computeDependencies(statements) {
	const deps = [];
	if (statements.some(s => s.t === 'Listen')) {
		deps.push('fs', 'addReadLine');
	}
	// TODO: (eventually) remove dup `deps`
	return deps;
}

function generateDependencies(deps) {
	return deps.map(d => dependencies[d]);
}

function parse(programText) {
	// Parser requires newline before EOF, add it in case there wasn't one already.
	return parser.parse(programText+'\n')
}

function compile(programText) {
	const statements = parse(programText)
	const dependencies = generateDependencies(computeDependencies(statements));
	const program = groupBlocks(statements)

	return [
		...dependencies,
		...program.map(expr)
	].join('')
}

module.exports = {
	varname,
	expr,
	groupBlocks,
	parse,
	compile,
	computeDependencies,
	generateDependencies,
}
