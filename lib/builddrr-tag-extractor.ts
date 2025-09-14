import { parseDocument } from 'htmlparser2';

export interface BuilddrrTag {
    type: 'code' | 'write';
    content: string;
    file?: string;
    startIndex: number;
    endIndex: number;
}

export class BuilddrrTagExtractor {
    static extractTags(html: string): BuilddrrTag[] {
        const dom = parseDocument(html);
        const tags: BuilddrrTag[] = [];

        this.traverseDOM(dom.children, tags, html);
        return tags;
    }

    private static traverseDOM(
        nodes: any[],
        tags: BuilddrrTag[],
        originalHtml: string,
        parentStartIndex: number = 0
    ): void {
        let currentIndex = parentStartIndex;

        for (const node of nodes) {
            if (node.type === 'tag') {
                if (node.name === 'builddrr-code') {
                    const content = this.extractTextContent(node.children || []);
                    const startIndex = originalHtml.indexOf(`<builddrr-code`, currentIndex);
                    const endIndex = originalHtml.indexOf(`</builddrr-code>`, startIndex) + 15;

                    tags.push({
                        type: 'code',
                        content: content.trim(),
                        startIndex,
                        endIndex
                    });
                } else if (node.name === 'builddrr-write') {
                    const file = node.attribs?.file || '';
                    const content = this.extractTextContent(node.children || []);
                    const startIndex = originalHtml.indexOf(`<builddrr-write`, currentIndex);
                    const endIndex = originalHtml.indexOf(`</builddrr-write>`, startIndex) + 16;

                    tags.push({
                        type: 'write',
                        file,
                        content: content.trim(),
                        startIndex,
                        endIndex
                    });
                }

                // Recursively process children
                if (node.children) {
                    this.traverseDOM(node.children, tags, originalHtml, currentIndex);
                }
            }

            currentIndex += this.getNodeLength(node);
        }
    }

    private static extractTextContent(children: any[]): string {
        return children
            .map(child => {
                if (child.type === 'text') {
                    return child.data;
                } else if (child.type === 'tag') {
                    return this.extractTextContent(child.children || []);
                }
                return '';
            })
            .join('');
    }

    private static getNodeLength(node: any): number {
        if (node.type === 'text') {
            return node.data.length;
        } else if (node.type === 'tag') {
            return (node.children || []).reduce((sum: number, child: any) => sum + this.getNodeLength(child), 0);
        }
        return 0;
    }

    static removeTags(html: string): string {
        return html
            .replace(/<builddrr-code\s*>[\s\S]*?<\/builddrr-code\s*>/gi, '')
            .replace(/<builddrr-write\s+file="[^"]*">[\s\S]*?<\/builddrr-write\s*>/gi, '')
            .replace(/<builddrr-[^>]*>[\s\S]*?<\/builddrr-[^>]*>/gi, '') // Catch any other builddrr tags
            .replace(/<builddrr-[^>]*>/gi, ''); // Catch unclosed builddrr tags
    }

    static hasTags(html: string): boolean {
        return /<builddrr-(code|write)/i.test(html);
    }

    static extractFileContents(html: string): Record<string, string> {
        const tags = this.extractTags(html);
        const files: Record<string, string> = {};

        tags.forEach(tag => {
            if (tag.type === 'write' && tag.file) {
                files[tag.file] = tag.content;
            }
        });

        return files;
    }

    static extractFiles(html: string): string[] {
        const tags = this.extractTags(html);
        return tags
            .filter(tag => tag.type === 'write' && tag.file)
            .map(tag => tag.file!);
    }

    static filterContentForUser(html: string): string {
        // First remove all builddrr tags using htmlparser2
        const cleanContent = this.removeTags(html);

        // Additional aggressive filtering to remove any remaining code-like content
        const filteredContent = cleanContent
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`[^`]*`/g, '')
            .replace(/function\s*\(/gi, '')
            .replace(/const\s+\w+\s*=/gi, '')
            .replace(/let\s+\w+\s*=/gi, '')
            .replace(/var\s+\w+\s*=/gi, '')
            .replace(/import\s+.*?from/gi, '')
            .replace(/export\s+/gi, '')
            .replace(/return\s+/gi, '')
            .replace(/console\.log/gi, '')
            .replace(/React\./gi, '')
            .replace(/useState/gi, '')
            .replace(/useEffect/gi, '')
            .replace(/className=/gi, '')
            .replace(/onClick=/gi, '')
            .replace(/style=/gi, '')
            .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
            .replace(/[{}()\[\]]/g, '') // Remove brackets
            .replace(/[;=]/g, '') // Remove semicolons and equals
            .trim();

        return filteredContent;
    }

    static shouldShowToUser(html: string): boolean {
        const filteredContent = this.filterContentForUser(html);

        return (
            filteredContent.length > 0 &&
            !filteredContent.match(/[{}()\[\]]/) && // No brackets
            !filteredContent.match(/[;=]/) && // No semicolons or equals
            !filteredContent.includes("function") &&
            !filteredContent.includes("const") &&
            !filteredContent.includes("let") &&
            !filteredContent.includes("var") &&
            !filteredContent.includes("import") &&
            !filteredContent.includes("export") &&
            !filteredContent.includes("return") &&
            !filteredContent.includes("console") &&
            !filteredContent.includes("React") &&
            !filteredContent.includes("useState") &&
            !filteredContent.includes("useEffect") &&
            !filteredContent.includes("className") &&
            !filteredContent.includes("onClick") &&
            !filteredContent.includes("style") &&
            !filteredContent.includes("<builddrr") && // No builddrr tags
            !filteredContent.includes("</builddrr") && // No closing builddrr tags
            !filteredContent.match(/<[^>]*>/g) // No HTML tags at all
        );
    }
}
