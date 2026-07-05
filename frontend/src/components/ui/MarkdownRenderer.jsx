import React from 'react';

/**
 * A lightweight custom Markdown renderer for React, 
 * rendering bold, italic, headers, inline code, block code, lists, and links.
 * Avoids version conflicts with React 19 by not using external libraries.
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Split content by double newlines to separate block elements (paragraphs, lists, headers, code blocks)
  const blocks = content.split(/\n{2,}/);

  const parseInlineMarkdown = (text) => {
    // We parse inline formatting sequentially
    let parts = [{ type: 'text', content: text }];

    // 1. Process Bold: **text**
    parts = parts.flatMap(part => {
      if (part.type !== 'text') return [part];
      const subParts = [];
      const regex = /\*\*([^*]+)\*\*/g;
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(part.content)) !== null) {
        if (match.index > lastIndex) {
          subParts.push({ type: 'text', content: part.content.substring(lastIndex, match.index) });
        }
        subParts.push({ type: 'bold', content: match[1] });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.content.length) {
        subParts.push({ type: 'text', content: part.content.substring(lastIndex) });
      }
      return subParts;
    });

    // 2. Process Italic: *text*
    parts = parts.flatMap(part => {
      if (part.type !== 'text') return [part];
      const subParts = [];
      const regex = /\*([^*]+)\*/g;
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(part.content)) !== null) {
        if (match.index > lastIndex) {
          subParts.push({ type: 'text', content: part.content.substring(lastIndex, match.index) });
        }
        subParts.push({ type: 'italic', content: match[1] });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.content.length) {
        subParts.push({ type: 'text', content: part.content.substring(lastIndex) });
      }
      return subParts;
    });

    // 3. Process Inline Code: `code`
    parts = parts.flatMap(part => {
      if (part.type !== 'text') return [part];
      const subParts = [];
      const regex = /`([^`]+)`/g;
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(part.content)) !== null) {
        if (match.index > lastIndex) {
          subParts.push({ type: 'text', content: part.content.substring(lastIndex, match.index) });
        }
        subParts.push({ type: 'code', content: match[1] });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.content.length) {
        subParts.push({ type: 'text', content: part.content.substring(lastIndex) });
      }
      return subParts;
    });

    // 4. Process Links: [text](url)
    parts = parts.flatMap(part => {
      if (part.type !== 'text') return [part];
      const subParts = [];
      const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(part.content)) !== null) {
        if (match.index > lastIndex) {
          subParts.push({ type: 'text', content: part.content.substring(lastIndex, match.index) });
        }
        subParts.push({ type: 'link', label: match[1], url: match[2] });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < part.content.length) {
        subParts.push({ type: 'text', content: part.content.substring(lastIndex) });
      }
      return subParts;
    });

    return parts.map((part, idx) => {
      switch (part.type) {
        case 'bold':
          return <strong key={idx}>{part.content}</strong>;
        case 'italic':
          return <em key={idx}>{part.content}</em>;
        case 'code':
          return (
            <code 
              key={idx} 
              style={{ 
                fontFamily: 'Courier New, monospace', 
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                color: '#ffc107', 
                padding: '2px 4px', 
                borderRadius: '3px',
                fontSize: '90%'
              }}
            >
              {part.content}
            </code>
          );
        case 'link':
          return (
            <a 
              key={idx} 
              href={part.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#0dcaf0', textDecoration: 'underline' }}
            >
              {part.label}
            </a>
          );
        default:
          return part.content;
      }
    });
  };

  return (
    <div className="markdown-body-custom" style={{ wordBreak: 'break-word' }}>
      {blocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Check for Code Block: ```language\ncode\n```
        if (trimmed.startsWith('```')) {
          const lines = block.split('\n');
          const code = lines.slice(1, lines.length - (lines[lines.length - 1] === '```' ? 1 : 0)).join('\n');
          return (
            <pre 
              key={blockIdx} 
              style={{ 
                fontFamily: 'Courier New, monospace', 
                backgroundColor: '#1e293b', 
                color: '#f8fafc', 
                padding: '10px', 
                borderRadius: '6px', 
                overflowX: 'auto',
                fontSize: '13px',
                lineHeight: '1.5',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                margin: '8px 0'
              }}
            >
              <code>{code}</code>
            </pre>
          );
        }

        // 2. Check for Headers: #, ##, ###
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const text = headerMatch[2];
          const Tag = `h${level}`;
          
          // Render headings nicely, respecting system standards but keeping size adapted for chat
          const headingStyles = {
            h1: { fontSize: '1.25rem', fontWeight: 'bold', margin: '12px 0 6px 0' },
            h2: { fontSize: '1.15rem', fontWeight: 'bold', margin: '10px 0 5px 0' },
            h3: { fontSize: '1.05rem', fontWeight: 'bold', margin: '8px 0 4px 0' },
            h4: { fontSize: '1rem', fontWeight: 'bold', margin: '6px 0 3px 0' },
            h5: { fontSize: '0.95rem', fontWeight: 'bold', margin: '6px 0 2px 0' },
            h6: { fontSize: '0.9rem', fontWeight: 'bold', margin: '6px 0 2px 0' }
          };

          return (
            <Tag key={blockIdx} style={headingStyles[Tag] || { fontWeight: 'bold' }}>
              {parseInlineMarkdown(text)}
            </Tag>
          );
        }

        // 3. Check for Unordered Lists: - item or * item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const lines = block.split('\n');
          return (
            <ul key={blockIdx} style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>
              {lines.map((line, lineIdx) => {
                const itemText = line.replace(/^[-*]\s+/, '');
                return <li key={lineIdx} style={{ marginBottom: '4px' }}>{parseInlineMarkdown(itemText)}</li>;
              })}
            </ul>
          );
        }

        // 4. Check for Ordered Lists: 1. item
        if (/^\d+\.\s+/.test(trimmed)) {
          const lines = block.split('\n');
          return (
            <ol key={blockIdx} style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>
              {lines.map((line, lineIdx) => {
                const itemText = line.replace(/^\d+\.\s+/, '');
                return <li key={lineIdx} style={{ marginBottom: '4px' }}>{parseInlineMarkdown(itemText)}</li>;
              })}
            </ol>
          );
        }

        // 5. Default Paragraph
        const lines = block.split('\n');
        return (
          <p key={blockIdx} style={{ margin: '0 0 8px 0', lineHeight: '1.5' }}>
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {parseInlineMarkdown(line)}
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
