/**
 * Minimal SSE client for the backend's Server-Sent Events endpoints.
 *
 * The backend emits one event per frame: `data: {json}\n\n`. Network chunks
 * returned by `reader.read()` do not respect frame boundaries: a single frame
 * (especially a large one, like an embedded Object Diagram model) can be split
 * across several chunks. This client buffers the received text and only parses
 * a frame once its terminator (`\n\n`) has fully arrived, so no event is lost
 * or parsed while incomplete.
 */
export async function consumeSse<T>(
  url: string,
  body: object,
  onEvent: (data: T) => void,
): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `HTTP ${response.status}`);
  }

  const handleFrame = (frame: string) => {
    for (const line of frame.split('\n')) {
      if (line.startsWith('data: ')) {
        try {
          onEvent(JSON.parse(line.slice(6)) as T);
        } catch {
          // ignore malformed SSE frames
        }
      }
    }
  };

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // stream:true avoids corrupting multi-byte UTF-8 sequences split across
    // chunks. CRLF is normalized on the accumulated buffer so a \r/\n pair
    // split between two chunks is still handled.
    buffer += decoder.decode(value, { stream: true });
    buffer = buffer.replace(/\r\n/g, '\n');

    let sep = buffer.indexOf('\n\n');
    while (sep !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      handleFrame(frame);
      sep = buffer.indexOf('\n\n');
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) handleFrame(buffer);
}
