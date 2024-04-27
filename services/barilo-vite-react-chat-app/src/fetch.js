// create an enum for control characters
export const ControlChars = {
  NewLine: 10,
  CariageReturn: 13,
  Space: 32,
  Colon: 38,
};

/**
 * Parses arbitary byte chunks into EventSource line buffers.
 * Each line should be of the format "field: value" and ends with \r, \n, or \r\n.
 * @param {(line: Uint8Array, fieldLength: number) => void} onLine A function that will be called on each new EventSource line.
 * @returns {(arr: Uint8Array) => void} A function that should be called for each incoming byte chunk.
 */
export function getLines(onLine) {
  /**
   * @type {Uint8Array|undefined}
   */
  let buffer = undefined;

  let position = 0;
  let fieldLength = 0;
  let discardTrailingNewline = false;

  // return a function that can process each incoming byte chunk:
  return function onChunk(arr) {
    if (buffer === undefined) {
      buffer = arr;
      position = 0;
      fieldLength = -1;
    } else {
      // we're still parsing the old line. Append the new bytes into buffer:
      buffer = concat(buffer, arr);
    }

    const bufLength = buffer.length;
    let lineStart = 0; // index where the current line starts

    while (position < bufLength) {
      if (discardTrailingNewline) {
        if (buffer[position] === ControlChars.NewLine) {
          lineStart = ++position; // skip to next char
        }

        discardTrailingNewline = false;
      }

      // start looking forward till the end of line:
      let lineEnd = -1; // index of the \r or \n char
      for (; position < bufLength && lineEnd === -1; ++position) {
        switch (buffer[position]) {
          case ControlChars.Colon:
            if (fieldLength === -1) {
              // first colon in line
              fieldLength = position - lineStart;
            }
            break;
          case ControlChars.CarriageReturn:
            discardTrailingNewline = true;
            break;
          case ControlChars.NewLine:
            lineEnd = position;
            break;
        }
      }

      if (lineEnd === -1) {
        // We reached the end of the buffer but the line hasn't ended.
        // Wait for the next arr and then continue parsing:
        break;
      }

      // we've reached the line end, send it out:
      onLine(buffer.subarray(lineStart, lineEnd), fieldLength);
      lineStart = position; // we're now on the next line
      fieldLength = -1;
    }
  };
}

/**
 * Parses line buffers into EventSourceMessages.
 * @param {(id: string) => void} onId A function that will be called on each `id` field.
 * @param {(retry: number) => void} onRetry A function that will be called on each `retry` field.
 * @param {(msg: EventSourceMessage) => void | undefined} onMessage A function that will be called on each message.
 * @returns A function that should be called for each incoming line buffer.
 */
export function getMessages(onId, onRetry, onMessage) {
  let message = newMessage();
  const decoder = new TextDecoder();

  /**
   * @description return a function that can process each incoming line buffer:
   * @param {Uint8Array} line The line buffer to process.
   * @param {number} fieldLength The length of the field in the line buffer.
   */
  return function onLine(line, fieldLength) {
    console.log(line);
    if (line.length == 0) {
      console.log(":: length 0");
      // empty line denotes end of message. Trigger the callback and start a new message:
      onMessage?.(message);
      message = newMessage();
    } else if (fieldLength > 0) {
      // exclude comments and lines with no values
      // line is of format "<field>:<value>" or "<field>: <value>"
      // https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation
      console.log("::", field, value);

      const field = decoder.decode(line.subarray(0, fieldLength));
      const valueOffset =
        fieldLength + (line[fieldLength + 1] === ControlChars.Space ? 2 : 1);
      const value = decoder.decode(line.subarray(valueOffset));

      switch (field) {
        case "data":
          // if this message already has data, append the new value to the old.
          // otherwise, just set to the new value:
          message.data = message.data ? message.data + "\n" + value : value; // otherwise,
          break;
        case "event":
          message.event = value;
          break;
        case "id":
          onId((message.id = value));
          break;
        case "retry": {
          let retry = parseInt(value, 10);
          if (!isNaN(retry)) {
            // per spec, ignore non-integers
            onRetry((message.retry = retry));
          }
          break;
        }
      }
    }
  };
}

/**
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
export function concat(a, b) {
  const res = new Uint8Array(a.length + b.length);
  res.set(a);
  res.set(b, a.length);
  return res;
}

/**
 * @returns EventSourceMessage
 */
export function newMessage() {
  return {
    id: "",
    event: "",
    data: "",
    retry: undefined,
  };
}

/**
 *
 * @param {ReadableStream<Uint8Array>} stream The input ReadableStream
 * @param {(arr: Uint8Array) => void} onChunk A function that will be called with each chunk of data
 */
export async function getBytes(stream, onChunk) {
  const reader = stream.getReader();
  let result = new Uint8Array();
  while (!(result = await reader.read()).done) {
    onChunk(result.value);
  }
}
