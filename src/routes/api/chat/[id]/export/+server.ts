import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chats, messages } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { jsPDF } from 'jspdf';
import { chatIdParamSchema } from '$lib/schemas/chat';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const paramResult = chatIdParamSchema.safeParse(params);
	if (!paramResult.success) {
		return new Response('Validation failed', { status: 400 });
	}

	const { id } = paramResult.data;
	const format = url.searchParams.get('format') || 'md';

	const [chat] = await db
		.select()
		.from(chats)
		.where(and(eq(chats.id, id), eq(chats.userId, locals.user.id)))
		.limit(1);

	if (!chat) {
		return new Response('Chat not found', { status: 404 });
	}

	const chatMessages = await db
		.select()
		.from(messages)
		.where(eq(messages.chatId, id))
		.orderBy(asc(messages.createdAt));

	if (format === 'md') {
		let mdContent = `# ${chat.title}\n\n`;
		mdContent += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

		for (const msg of chatMessages) {
			const role = msg.role === 'user' ? '## You' : '## Assistant';

			// Try to parse json content for user text
			let text = msg.content;
			if (text.startsWith('{') && text.endsWith('}')) {
				try {
					const parsed = JSON.parse(text);
					if (parsed && typeof parsed === 'object' && 'text' in parsed) {
						text = parsed.text;
					}
				} catch {
					// Fallback to raw
				}
			}

			mdContent += `${role}\n\n${text}\n\n`;

			if (msg.sources && Array.isArray(msg.sources)) {
				mdContent += `**Sources:**\n`;
				msg.sources.forEach((s: any, i: number) => {
					mdContent += `${i + 1}. [${s.title}](${s.url})\n`;
				});
				mdContent += `\n`;
			}

			mdContent += `---\n\n`;
		}

		return new Response(mdContent, {
			headers: {
				'Content-Type': 'text/markdown',
				'Content-Disposition': `attachment; filename="chat_export.md"`
			}
		});
	} else if (format === 'pdf') {
		const doc = new jsPDF();

		let yOffset = 20;
		const margin = 20;
		const pageWidth = doc.internal.pageSize.getWidth();
		const maxWidth = pageWidth - margin * 2;

		doc.setFontSize(18);
		doc.text(chat.title, margin, yOffset);
		yOffset += 10;

		doc.setFontSize(10);
		doc.setTextColor(150);
		doc.text(`Exported on ${new Date().toLocaleString()}`, margin, yOffset);
		yOffset += 15;

		doc.setTextColor(0);
		doc.setFontSize(12);

		for (const msg of chatMessages) {
			const isUser = msg.role === 'user';
			doc.setFont('helvetica', 'bold');
			doc.text(isUser ? 'You:' : 'Assistant:', margin, yOffset);
			yOffset += 7;

			doc.setFont('helvetica', 'normal');
			let text = msg.content;
			if (text.startsWith('{') && text.endsWith('}')) {
				try {
					const parsed = JSON.parse(text);
					if (parsed && typeof parsed === 'object' && 'text' in parsed) {
						text = parsed.text;
					}
				} catch {
					// Fallback to raw
				}
			}

			// Clean up markdown hashes and stars for basic PDF readability
			const cleanText = text.replace(/#/g, '').replace(/\*/g, '');
			const splitText = doc.splitTextToSize(cleanText, maxWidth);

			// Check if we need a new page
			if (yOffset + splitText.length * 5 > doc.internal.pageSize.getHeight() - margin) {
				doc.addPage();
				yOffset = margin;
			}

			doc.text(splitText, margin, yOffset);
			yOffset += splitText.length * 6 + 5;

			if (msg.sources && Array.isArray(msg.sources)) {
				doc.setFont('helvetica', 'italic');
				doc.text('Sources:', margin, yOffset);
				yOffset += 6;

				msg.sources.forEach((s: any, i: number) => {
					const sourceText = doc.splitTextToSize(`${i + 1}. ${s.url}`, maxWidth);
					doc.text(sourceText, margin, yOffset);
					yOffset += sourceText.length * 5 + 2;
				});
				yOffset += 5;
			}

			if (yOffset > doc.internal.pageSize.getHeight() - margin) {
				doc.addPage();
				yOffset = margin;
			}
		}

		return new Response(doc.output('arraybuffer'), {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="chat_export.pdf"`
			}
		});
	}

	return new Response('Unsupported format', { status: 400 });
};
