import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { parse } from 'csv-parse';
import StreamJsonParser from 'stream-json';
import StreamArray from 'stream-json/streamers/StreamArray.js';
import type { RawRecord, RecordSource } from './types.js';

/**
 * Streaming CSV source. Uses csv-parse with `columns: true` so records are keyed
 * by header (mapping is by name, never position). Never buffers the whole file.
 */
export class CsvStreamSource implements RecordSource {
  readonly describe: string;
  constructor(
    private readonly input: string | Readable,
    describe?: string,
  ) {
    this.describe = describe ?? (typeof input === 'string' ? `csv:${input}` : 'csv:stream');
  }

  async *read(): AsyncIterable<{ index: number; raw: RawRecord }> {
    const stream = typeof this.input === 'string' ? createReadStream(this.input) : this.input;
    const parser = stream.pipe(
      parse({ columns: true, trim: true, skip_empty_lines: true, bom: true, relax_column_count: true }),
    );
    let index = 0;
    for await (const record of parser) {
      yield { index: index++, raw: record as RawRecord };
    }
  }
}

/**
 * Streaming JSON-array source (`[ {...}, {...} ]`). Uses stream-json so a large
 * array is not parsed into memory at once.
 */
export class JsonArraySource implements RecordSource {
  readonly describe: string;
  constructor(
    private readonly path: string,
    describe?: string,
  ) {
    this.describe = describe ?? `json:${path}`;
  }

  async *read(): AsyncIterable<{ index: number; raw: RawRecord }> {
    const pipeline = createReadStream(this.path)
      .pipe(StreamJsonParser.parser())
      .pipe(StreamArray.streamArray());
    let index = 0;
    for await (const chunk of pipeline as AsyncIterable<{ value: unknown }>) {
      yield { index: index++, raw: chunk.value as RawRecord };
    }
  }
}

/** Build a source from a file path by extension. */
export function sourceForFile(path: string): RecordSource {
  const lower = path.toLowerCase();
  if (lower.endsWith('.json')) return new JsonArraySource(path);
  return new CsvStreamSource(path);
}

/** Test helper: a CSV source backed by an in-memory string. */
export function csvSourceFromString(csv: string): RecordSource {
  return new CsvStreamSource(Readable.from([csv]), 'csv:string');
}
