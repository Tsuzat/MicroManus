import { marked } from 'marked';
import { getModelConfig } from '$lib/ai/providers';

/**
 * Returns a complete, beautifully styled HTML document for the chat export.
 * This HTML is designed to be rendered by Playwright to a PDF.
 */
export async function renderChatToHTML(chatTitle: string, exportDate: string, messages: any[]): Promise<string> {
	let messagesHtml = '';

	for (const msg of messages) {
		const isUser = msg.role === 'user';
		
		// Use marked to parse the markdown content
		let rawContent = msg.content;
		if (rawContent.startsWith('{') && rawContent.endsWith('}')) {
			try {
				const parsed = JSON.parse(rawContent);
				if (parsed && typeof parsed === 'object' && 'text' in parsed) {
					rawContent = parsed.text;
				}
			} catch {
				// fallback
			}
		}
		const contentHtml = await marked.parse(rawContent);

		const roleName = isUser 
			? 'YOU' 
			: msg.modelId
				? (getModelConfig(msg.modelId)?.label?.toUpperCase() ?? msg.modelId.toUpperCase())
				: 'ASSISTANT';

		const roleColor = isUser ? '#4f46e5' : '#6b7280'; // indigo-600 vs gray-500
		const bgColor = isUser ? '#eef2ff' : '#f9fafb'; // indigo-50 vs gray-50

		let reasoningHtml = '';
		if (!isUser && msg.reasoning) {
			const reasoningClean = msg.reasoning;
			reasoningHtml = `
				<div class="reasoning-block">
					<div class="reasoning-title">Thinking:</div>
					<div class="reasoning-content">${reasoningClean}</div>
				</div>
			`;
		}

		let sourcesHtml = '';
		if (!isUser && msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0) {
			sourcesHtml = `
				<div class="sources-block">
					<div class="sources-title">Sources:</div>
					<ol class="sources-list">
						${msg.sources.map((s: any) => `<li><a href="${s.url}">${s.title || s.url}</a></li>`).join('')}
					</ol>
				</div>
			`;
		}

		messagesHtml += `
			<div class="message">
				<div class="role-bar" style="background-color: ${roleColor};"></div>
				<div class="message-inner">
					<div class="role-label" style="color: ${roleColor};">${roleName}</div>
					${reasoningHtml}
					<div class="prose">
						${contentHtml}
					</div>
					${sourcesHtml}
				</div>
			</div>
			<hr class="separator" />
		`;
	}

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
		
		:root {
			--font-sans: 'Inter', system-ui, sans-serif;
			--text-main: #111827;
			--text-muted: #6b7280;
			--border: #e5e7eb;
		}
		
		body {
			font-family: var(--font-sans);
			color: var(--text-main);
			line-height: 1.6;
			margin: 0;
			padding: 0;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		/* Header & Page structure handled by Playwright headerTemplate, 
		   but we put the title block in the body */
		.header-block {
			padding: 40px 40px 20px 40px;
			border-bottom: 1px solid var(--border);
			margin-bottom: 30px;
		}
		
		.chat-title {
			font-size: 24px;
			font-weight: 700;
			margin: 0 0 8px 0;
			color: #111827;
		}
		
		.chat-meta {
			font-size: 14px;
			color: var(--text-muted);
			margin: 0;
		}

		/* Messages */
		.message {
			display: flex;
			padding: 0 40px;
			margin-bottom: 24px;
			page-break-inside: avoid;
		}
		
		.role-bar {
			width: 4px;
			border-radius: 4px;
			margin-right: 16px;
			flex-shrink: 0;
		}
		
		.message-inner {
			flex: 1;
			min-width: 0;
		}
		
		.role-label {
			font-size: 12px;
			font-weight: 700;
			letter-spacing: 0.05em;
			margin-bottom: 8px;
		}
		
		/* Reasoning */
		.reasoning-block {
			background-color: #f5f3ff; /* violet-50 */
			border-radius: 6px;
			padding: 12px 16px;
			margin-bottom: 16px;
		}
		
		.reasoning-title {
			font-size: 11px;
			font-style: italic;
			color: #6b7280;
			margin-bottom: 6px;
		}
		
		.reasoning-content {
			font-size: 12px;
			color: #4b5563;
			white-space: pre-wrap;
			font-family: ui-monospace, monospace;
		}
		
		/* Sources */
		.sources-block {
			margin-top: 16px;
		}
		
		.sources-title {
			font-size: 12px;
			font-weight: 600;
			color: #4b5563;
			margin-bottom: 4px;
		}
		
		.sources-list {
			margin: 0;
			padding-left: 20px;
			font-size: 12px;
			color: #4f46e5;
		}
		
		.sources-list a {
			color: inherit;
			text-decoration: none;
		}
		
		.separator {
			border: 0;
			border-top: 1px solid var(--border);
			margin: 24px 40px;
		}

		/* Typography (Prose) */
		.prose {
			font-size: 14px;
			color: #1f2937;
		}
		
		.prose p { margin-top: 0; margin-bottom: 16px; }
		.prose p:last-child { margin-bottom: 0; }
		
		.prose h1, .prose h2, .prose h3, .prose h4 {
			color: #111827;
			font-weight: 600;
			margin-top: 24px;
			margin-bottom: 12px;
		}
		.prose h1 { font-size: 24px; }
		.prose h2 { font-size: 20px; }
		.prose h3 { font-size: 18px; }
		
		.prose ul, .prose ol {
			margin-top: 0;
			margin-bottom: 16px;
			padding-left: 24px;
		}
		
		.prose code {
			font-family: ui-monospace, monospace;
			background-color: #f3f4f6;
			padding: 2px 4px;
			border-radius: 4px;
			font-size: 13px;
			color: #111827;
		}
		
		.prose pre {
			background-color: #1f2937;
			color: #f9fafb;
			padding: 16px;
			border-radius: 8px;
			overflow-x: auto;
			font-size: 13px;
			margin-bottom: 16px;
		}
		
		.prose pre code {
			background-color: transparent;
			padding: 0;
			color: inherit;
		}
		
		.prose blockquote {
			border-left: 4px solid #e5e7eb;
			margin: 0 0 16px 0;
			padding-left: 16px;
			font-style: italic;
			color: #4b5563;
		}
		
		.prose a {
			color: #4f46e5;
			text-decoration: underline;
		}
		
		.prose table {
			width: 100%;
			border-collapse: collapse;
			margin-bottom: 16px;
		}
		
		.prose th, .prose td {
			border: 1px solid #e5e7eb;
			padding: 8px 12px;
			text-align: left;
		}
		
		.prose th { background-color: #f9fafb; }
	</style>
</head>
<body>
	<div class="header-block">
		<h1 class="chat-title">${chatTitle}</h1>
		<p class="chat-meta">Exported on ${exportDate} · ${messages.length} messages</p>
	</div>
	
	<div class="messages">
		${messagesHtml}
	</div>
</body>
</html>
	`;

	return html;
}
