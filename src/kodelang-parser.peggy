Program = Statement *
Statement = _? s:(Operation/BlankLine) ','? _* '\n' {return s}
BlankLine = '' {return {t: 'BlankLine'}}

Operation = 출력 
_ = ((' ' / '\t')+) / Comment
Comment = '(' [^)]* ')'
String = '"' v:$[^"]+ '"'
	{ return {t: 'Literal', v}}

SimpleExpression = String 

ArithmeticOperator =
	('빼기') {return '-'}
	/ ('더하기') {return '+'}
	/ ('곱하기') {return '*'}
	/ ('나누기') {return '/'}

ArithmeticExpression =
	l:SimpleExpression
	_ o:ArithmeticOperator _
	r:SimpleExpression
	{ return {t: 'Arithmetic', l, o, r} }

Expression = ArithmeticExpression

출력 = ('출력') _ e:SimpleExpression
	{return {t:'출력', e}}
