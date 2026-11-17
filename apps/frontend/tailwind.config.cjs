/** @type {import('tailwindcss').Config} */
module.exports = {
	theme: {
		extend: {
			sizes: {
				file: '6rem',
			},
			backgroundImage: {
				'fancy-gradient': `
				 radial-gradient(circle at 16% 83%, rgba(148, 148, 148,0.06) 0%, rgba(148, 148, 148,0.06) 50%,rgba(63, 63, 63,0.06) 50%, rgba(63, 63, 63,0.06) 100%),radial-gradient(circle at 68% 87%, rgba(66, 66, 66,0.06) 0%, rgba(66, 66, 66,0.06) 50%,rgba(105, 105, 105,0.06) 50%, rgba(105, 105, 105,0.06) 100%),radial-gradient(circle at 38% 50%, rgba(123, 123, 123,0.06) 0%, rgba(123, 123, 123,0.06) 50%,rgba(172, 172, 172,0.06) 50%, rgba(172, 172, 172,0.06) 100%),linear-gradient(90deg, hsl(18,0%,1%),hsl(18,0%,1%));

				`,
				'gradient-conic': 'conic-gradient(from 0deg, transparent 0deg, cyan 90deg, transparent 180deg)',
			},
			keyframes: {
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(4px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'fade-out-down': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(4px)' },
				},
			},
			animation: {
				'spin-slow': 'spin 4s linear infinite',
				'fade-in-up': 'fade-in-up 0.25s ease-out forwards',
				'fade-out-down': 'fade-out-down 0.2s ease-in forwards',
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '100ch',
						'code::before': { content: 'none' },
						'code::after': { content: 'none' },
						'pre code::before': { content: 'none' },
						'pre code::after': { content: 'none' },
						pre: {
							backgroundColor: 'var(--color-muted)',
							borderWidth: '1px',
							borderColor: 'var(--color-border)',
							borderRadius: 'var(--radius-md)',
							padding: '1rem',
							overflow: 'auto',
						},
						code: {
							backgroundColor: 'var(--color-muted)',
							borderWidth: '1px',
							borderColor: 'var(--color-border)',
							borderRadius: 'var(--radius-sm)',
							padding: '0.125rem 0.25rem',
							fontWeight: '500',
							'&::before': {
								content: 'none',
							},
							'&::after': {
								content: 'none',
							},
						},
						'pre code': {
							backgroundColor: 'transparent',
							borderWidth: '0',
							padding: '0',
							borderRadius: '0',
						},
						table: {
							borderCollapse: 'collapse',
							borderWidth: '2px',
							borderColor: 'var(--color-border)',
						},
						th: {
							borderWidth: '2px',
							borderColor: 'var(--color-border)',
							backgroundColor: 'var(--color-background)',
							padding: '8px',
						},
						td: {
							borderWidth: '1px',
							borderColor: 'var(--color-border)',
							padding: '8px',
							'padding-inline-start': 'unset',
							'&:focus': {
								borderColor: 'var(--color-primary)',
							},
						},
					},
				},
			},
		},
	},
};
