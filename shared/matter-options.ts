/**
 * gray-matter's built-in `javascript` engine parses a `---js` (or
 * `language: js`) front matter block with a bare `eval()` (security
 * review L9). Every front matter block this repository ever writes
 * uses the plain `---` YAML delimiter, so a file whose front matter
 * asks for the `javascript` engine is not one this code wrote; refusing
 * it here, rather than falling through to `js-yaml`, means a post file
 * (hand-edited, or written by an older or compromised version of this
 * connector) can never execute code just by being read back.
 */
export const safeMatterOptions: { engines: { javascript: (input: string) => object } } = {
  engines: {
    javascript() {
      throw new Error('The gray-matter "javascript" front matter engine is disabled for this store.');
    },
  },
};
