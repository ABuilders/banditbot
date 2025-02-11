/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 17:49:04
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-10 17:53:31
 */

export class ExceptionalBox
{
    static createBox(text: string)
    {
        const lines = text.split('\n');
        const maxLength = Math.max(...lines.map(line => line.replace(/\x1b\[[0-9;]*m/g, '').length)); // Remove ANSI colors
        const border = '┌' + '─'.repeat(maxLength + 2) + '┐';
        const bottomBorder = '└' + '─'.repeat(maxLength + 2) + '┘';

        console.log(border);
        lines.forEach(line =>
        {
            const strippedLine = line.replace(/\x1b\[[0-9;]*m/g, '');
            console.log(`│ ${line}${' '.repeat(maxLength - strippedLine.length)} │`);
        });
        console.log(bottomBorder);
    }
}