import axios from 'axios';
import { LocalPageReader, JinaPageReader, extractText } from './page-reader';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('extractText', () => {
  it('strips script tags and their content', () => {
    const html = '<p>hello</p><script>var visa="visa";</script>';
    expect(extractText(html)).not.toContain('visa');
    expect(extractText(html)).toContain('hello');
  });

  it('strips style tags and their content', () => {
    const html = '<p>world</p><style>.visa { color: red; }</style>';
    expect(extractText(html)).not.toContain('visa');
    expect(extractText(html)).toContain('world');
  });

  it('strips HTML tags, leaving text content', () => {
    const html = '<h1>Title</h1><p>Body text</p>';
    const result = extractText(html);
    expect(result).toContain('title');
    expect(result).toContain('body text');
  });
});

describe('LocalPageReader', () => {
  it('returns clean CASE-PRESERVED text, stripping script contents', async () => {
    const reader = new LocalPageReader();
    const html =
      '<html><script>visa</script><body>Bonjour le monde</body></html>';
    const result = await reader.read('x', html);
    // La casse est préservée : c'est elle qui porte « CERFA », « CPAM »… pour le LLM.
    expect(result).toContain('Bonjour le monde');
    expect(result).not.toContain('visa');
  });
});

describe('JinaPageReader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns clean CASE-PRESERVED text from Jina when request succeeds', async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: '# Clean Title\nVisa application page' });
    const reader = new JinaPageReader('https://r.jina.ai');
    const result = await reader.read(
      'https://example.gov/visa',
      '<html>raw</html>',
    );
    expect(result).toContain('Visa application page');
    expect(result).toContain('Clean Title');
  });

  it('falls back to extractText(rawHtml) when axios.get rejects', async () => {
    mockedAxios.get = jest
      .fn()
      .mockRejectedValueOnce(new Error('network error'));
    const reader = new JinaPageReader('https://r.jina.ai');
    const html = '<html><body>Fallback content</body></html>';
    const result = await reader.read('https://example.gov/visa', html);
    expect(result).toContain('Fallback content');
  });

  it('falls back to extractText(rawHtml) when Jina returns empty string', async () => {
    mockedAxios.get = jest.fn().mockResolvedValueOnce({ data: '' });
    const reader = new JinaPageReader('https://r.jina.ai');
    const html = '<html><body>Local fallback</body></html>';
    const result = await reader.read('https://example.gov', html);
    expect(result).toContain('Local fallback');
  });
});
