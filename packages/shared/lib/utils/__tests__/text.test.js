/**
 * 🧪 Tests for Text Processing Utilities
 */
import { describe, it, expect } from 'vitest';
import { truncateToTokens, estimateTokenCount, cleanText, extractCodeBlocks, stripMarkdown, highlightSearchTerms, } from '../text.js';
describe('truncateToTokens', () => {
    it('should not truncate text within token limit', () => {
        const text = 'Hello world';
        const result = truncateToTokens(text, 10);
        expect(result).toBe(text);
    });
    it('should truncate text exceeding token limit', () => {
        const text = 'a'.repeat(100);
        const result = truncateToTokens(text, 10);
        expect(result.length).toBeLessThan(text.length);
        expect(result).toContain('...');
    });
    it('should handle empty strings', () => {
        const result = truncateToTokens('', 10);
        expect(result).toBe('');
    });
});
describe('estimateTokenCount', () => {
    it('should estimate token count correctly', () => {
        const text = 'a'.repeat(400); // ~100 tokens at 4 chars/token
        const estimate = estimateTokenCount(text);
        expect(estimate).toBe(100);
    });
    it('should handle empty strings', () => {
        const estimate = estimateTokenCount('');
        expect(estimate).toBe(0);
    });
    it('should round up partial tokens', () => {
        const text = 'abc'; // 3 chars = 0.75 tokens, should round to 1
        const estimate = estimateTokenCount(text);
        expect(estimate).toBe(1);
    });
});
describe('cleanText', () => {
    it('should normalize line endings', () => {
        const text = 'Hello\r\nWorld\r\n';
        const cleaned = cleanText(text);
        expect(cleaned).toBe('Hello\nWorld');
    });
    it('should remove excessive newlines', () => {
        const text = 'Hello\n\n\n\n\nWorld';
        const cleaned = cleanText(text);
        expect(cleaned).toBe('Hello\n\nWorld');
    });
    it('should normalize spaces', () => {
        const text = 'Hello    World';
        const cleaned = cleanText(text);
        expect(cleaned).toBe('Hello World');
    });
    it('should trim whitespace', () => {
        const text = '  Hello World  ';
        const cleaned = cleanText(text);
        expect(cleaned).toBe('Hello World');
    });
});
describe('extractCodeBlocks', () => {
    it('should extract code blocks with language', () => {
        const markdown = '```typescript\nconst x = 1;\n```';
        const blocks = extractCodeBlocks(markdown);
        expect(blocks).toHaveLength(1);
        expect(blocks[0]?.language).toBe('typescript');
        expect(blocks[0]?.code).toBe('const x = 1;');
    });
    it('should extract code blocks without language', () => {
        const markdown = '```\nconst x = 1;\n```';
        const blocks = extractCodeBlocks(markdown);
        expect(blocks).toHaveLength(1);
        expect(blocks[0]?.language).toBe('');
        expect(blocks[0]?.code).toBe('const x = 1;');
    });
    it('should extract multiple code blocks', () => {
        const markdown = '```js\nconst x = 1;\n```\n\nSome text\n\n```python\ny = 2\n```';
        const blocks = extractCodeBlocks(markdown);
        expect(blocks).toHaveLength(2);
        expect(blocks[0]?.language).toBe('js');
        expect(blocks[1]?.language).toBe('python');
    });
    it('should return empty array for no code blocks', () => {
        const markdown = 'Just some text';
        const blocks = extractCodeBlocks(markdown);
        expect(blocks).toHaveLength(0);
    });
});
describe('stripMarkdown', () => {
    it('should remove code blocks', () => {
        const markdown = 'Text ```code block``` more text';
        const stripped = stripMarkdown(markdown);
        expect(stripped).not.toContain('```');
        expect(stripped).toContain('Text');
        expect(stripped).toContain('more text');
    });
    it('should remove inline code', () => {
        const markdown = 'Use `const` for variables';
        const stripped = stripMarkdown(markdown);
        expect(stripped).toBe('Use const for variables');
    });
    it('should remove headers', () => {
        const markdown = '# Header\n## Subheader';
        const stripped = stripMarkdown(markdown);
        expect(stripped).toBe('Header\nSubheader');
    });
    it('should remove bold formatting', () => {
        const markdown = 'This is **bold** text';
        const stripped = stripMarkdown(markdown);
        expect(stripped).toBe('This is bold text');
    });
    it('should remove italic formatting', () => {
        const markdown = 'This is *italic* text';
        const stripped = stripMarkdown(markdown);
        expect(stripped).toBe('This is italic text');
    });
    it('should remove links', () => {
        const markdown = 'Check [this link](https://example.com)';
        const stripped = stripMarkdown(markdown);
        expect(stripped).toBe('Check this link');
    });
    it('should remove images', () => {
        const markdown = 'Image: ![alt text](image.png)';
        const stripped = stripMarkdown(markdown);
        expect(stripped).not.toContain('![');
        expect(stripped).not.toContain('](');
    });
    it('should remove list markers', () => {
        const markdown = '- Item 1\n* Item 2\n+ Item 3';
        const stripped = stripMarkdown(markdown);
        expect(stripped).toContain('Item 1');
        expect(stripped).not.toContain('- ');
        expect(stripped).not.toContain('* ');
    });
});
describe('highlightSearchTerms', () => {
    it('should highlight search terms', () => {
        const text = 'The quick brown fox jumps over the lazy dog';
        const highlighted = highlightSearchTerms(text, ['quick', 'fox']);
        expect(highlighted).toContain('**quick**');
        expect(highlighted).toContain('**fox**');
    });
    it('should be case insensitive', () => {
        const text = 'The Quick Brown Fox';
        const highlighted = highlightSearchTerms(text, ['quick', 'FOX']);
        expect(highlighted).toContain('**Quick**');
        expect(highlighted).toContain('**Fox**');
    });
    it('should add context around matches', () => {
        const text = 'a'.repeat(1000) + 'important' + 'b'.repeat(1000);
        const highlighted = highlightSearchTerms(text, ['important'], 100);
        expect(highlighted).toContain('**important**');
        expect(highlighted).toContain('...');
        expect(highlighted.length).toBeLessThan(text.length);
    });
    it('should return truncated text when no matches found', () => {
        const text = 'a'.repeat(1000);
        const highlighted = highlightSearchTerms(text, ['notfound'], 100);
        expect(highlighted).toContain('...');
    });
    it('should handle empty search terms', () => {
        const text = 'Hello world';
        const highlighted = highlightSearchTerms(text, []);
        expect(highlighted).toBeTruthy();
    });
});
//# sourceMappingURL=text.test.js.map