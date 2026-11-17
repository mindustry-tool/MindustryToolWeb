'use client';

import { Fragment, useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { Tran } from '@/i18n/tran';
import { cn } from '@/lib/utils';

const KEY_PATTERN = /[\w-]+/;

export default function JsonDisplay({
	className,
	json,
	depth = 0,
	expand,
}: {
	className?: string;
	json: any;
	depth?: number;
	expand?: boolean;
}) {
	const [show, setShow] = useState(50);

	if (json === null) {
		return null;
	}

	json = parseCustomJsonNested(json);

	switch (typeof json) {
		case 'boolean':
			return <p className={cn('text-wrap w-full text-sm', className)}>{json ? 'true' : 'false'}</p>;
		case 'string':
		case 'bigint':
		case 'number':
		case 'undefined':
			return <p className={cn('text-wrap w-full text-sm', className)}>{json}</p>;

		case 'object': {
			if (json === null) {
				return 'null';
			}

			if (Array.isArray(json)) {
				const isObjectArray = json.some((item) => typeof item === 'object');

				return (
					<div className={className}>
						[{isObjectArray && <br />}
						<div className="pl-4 text-sm">
							{json
								.filter((_, index) => index <= show)
								.map((item, index) => (
									<Fragment key={index}>
										<JsonDisplay key={index} depth={++depth} json={item} expand={expand} />
										{isObjectArray && <br />}
									</Fragment>
								))}
							{show < json.length && (
								<div
									className="text-center text-sm font-semibold underline"
									onClick={() => {
										setShow((prev) => prev + 50);
									}}
								>
									<Tran text="show-more" />({json.length - show}
									)+
								</div>
							)}
						</div>
						]
					</div>
				);
			}

			return (
				<>
					<div className={className}>{'{'}</div>
					<div className={cn('pl-4 divide-y text-sm', className)}>
						{Object.entries(json)
							.sort(([a], [b]) => a.localeCompare(b))
							.filter((_, index) => index <= show)
							.map(([key, value]) => (
								<div className="py-2 text-sm" key={key}>
									{value === null || value === undefined ? (
										<span>
											{key}:{' null'}
										</span>
									) : typeof value === 'boolean' ? (
										<span className="space-x-1">
											<span>{key}:</span>
											<span>{value ? ' true' : ' false'}</span>
										</span>
									) : typeof value === 'string' || typeof value === 'number' ? (
										<span className="space-x-1">
											<span>{key}:</span>
											<span>{value}</span>
										</span>
									) : Array.isArray(value) && value.length === 0 ? (
										<span>
											{key}:{' []'}
										</span>
									) : typeof value === 'object' && Object.entries(value).length === 0 ? (
										<span>
											{key}:{' {}'}
										</span>
									) : (
										<Accordion type="single" collapsible>
											<AccordionItem className="border-none" value={key} defaultValue={expand ? key : undefined}>
												<AccordionTrigger className="h-fit p-0 text-sm">
													{key}:
													{Array.isArray(value) //
														? ` [<${value.length}>]`
														: ` {<${Object.entries(value).length}>}`}
												</AccordionTrigger>
												<AccordionContent className="pb-0">
													<JsonDisplay json={value} depth={++depth} expand={expand} />
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									)}
								</div>
							))}
					</div>
					{show < Object.entries(json).length && (
						<div
							className={cn('text-center underline font-semibold text-sm', className)}
							onClick={() => {
								setShow((prev) => prev + 50);
							}}
						>
							<Tran text="show-more" />({Object.entries(json).length - show}
							)+
						</div>
					)}
					<div className={className}>{'}'}</div>
				</>
			);
		}

		case 'function':
		case 'symbol':
		default:
			return undefined;
	}
}

function parseCustomJson(str: any) {
	if (typeof str !== 'string') {
		return str;
	}

	if (str.startsWith('[') && str.endsWith(']')) {
		str = str.substring(1, str.length - 1);

		if (str.length === 0) {
			return '[]';
		}

		const result: string[] = [];

		while (str.includes(',')) {
			let nextCommaIndex = -1;

			const stack = [];

			for (let i = 0; i < str.length; i++) {
				const char = str[i];

				if (char === '{') {
					stack.push('{');
				} else if (char === '}') {
					for (let j = stack.length - 1; j >= 0; j--) {
						if (stack[j] === '{') {
							stack.pop();
							break;
						}
					}
				} else if (char === '[') {
					stack.push('[');
				} else if (char === ']') {
					for (let j = stack.length - 1; j >= 0; j--) {
						if (stack[j] === '[') {
							stack.pop();
							break;
						}
					}
				} else if (char === ',') {
					if (stack.length === 0) {
						nextCommaIndex = i;
						break;
					}
				}
			}
			const value = nextCommaIndex === -1 ? str : str.substring(0, nextCommaIndex);

			result.push(parseCustomJson(value));

			str = nextCommaIndex === -1 ? '' : str.substring(nextCommaIndex + 1);
		}

		return result;
	}

	if (str.startsWith('{') && str.endsWith('}') && str.includes(':')) {
		str = str.substring(1, str.length - 1);

		if (str.length === 0) {
			return '{}';
		}

		const result: Record<string, any> = {};

		while (str.includes(':')) {
			const stack = [];
			const colonIndex = str.indexOf(':');
			let nextCommaIndex = -1;

			const keyString = str.substring(0, colonIndex);

			const isValidKey = KEY_PATTERN.test(keyString);

			if (isValidKey) {
				str = str.substring(colonIndex + 1);

				for (let i = 0; i < str.length; i++) {
					const char = str[i];

					if (char === '{') {
						stack.push('{');
					} else if (char === '}') {
						for (let j = stack.length - 1; j >= 0; j--) {
							if (stack[j] === '{') {
								stack.pop();
								break;
							}
						}
					} else if (char === '[') {
						stack.push('[');
					} else if (char === ']') {
						for (let j = stack.length - 1; j >= 0; j--) {
							if (stack[j] === '[') {
								stack.pop();
								break;
							}
						}
					} else if (char === ',') {
						if (stack.length === 0) {
							nextCommaIndex = i;
							break;
						}
					}
				}
				const value = nextCommaIndex === -1 ? str : str.substring(0, nextCommaIndex);

				result[keyString] = parseCustomJson(value);
			}

			str = nextCommaIndex === -1 ? '' : str.substring(nextCommaIndex + 1);
		}

		return result;
	}

	return str;
}

function parseCustomJsonNested(json: any) {
	if (json === null) {
		return null;
	}

	switch (typeof json) {
		case 'bigint':
		case 'boolean':
		case 'number':
		case 'undefined':
			return json;

		case 'string':
			return parseCustomJson(json);

		case 'object': {
			if (Array.isArray(json)) {
				return json.map((item) => parseCustomJson(item));
			}

			return Object.fromEntries(
				Object.entries(json)
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([key, value]) => [key, parseCustomJson(value)]),
			);
		}

		case 'function':
		case 'symbol':
		default:
			return undefined;
	}
}
