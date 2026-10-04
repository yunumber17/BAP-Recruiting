import { createWriteStream } from 'node:fs';
import { once } from 'node:events';

/** Escape a single CSV field per RFC 4180. */
export function csvField(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function csvRow(values: readonly unknown[]): string {
  return values.map(csvField).join(',');
}

/** Streaming CSV writer — never buffers all rows in memory. */
export class CsvFileWriter {
  private readonly stream;
  private opened = false;

  constructor(
    path: string,
    private readonly headers: readonly string[],
  ) {
    this.stream = createWriteStream(path, { encoding: 'utf8' });
  }

  private ensureHeader(): void {
    if (!this.opened) {
      this.stream.write(csvRow(this.headers) + '\n');
      this.opened = true;
    }
  }

  write(values: readonly unknown[]): void {
    this.ensureHeader();
    this.stream.write(csvRow(values) + '\n');
  }

  async close(): Promise<void> {
    this.ensureHeader();
    this.stream.end();
    await once(this.stream, 'finish');
  }
}
