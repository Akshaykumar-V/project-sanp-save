const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const { transformSync } = require('esbuild');
const renderer = require('react-test-renderer');
const { act } = renderer;

const filename = path.resolve(__dirname, '..', 'src', 'components', 'UploadZone.jsx');
const code = transformSync(fs.readFileSync(filename, 'utf8'), {
  loader: 'jsx', jsx: 'automatic', format: 'cjs', target: 'node20',
}).code;
const loaded = new Module(filename, module);
loaded.filename = filename;
loaded.paths = Module._nodeModulePaths(path.dirname(filename));
loaded._compile(code, filename);
const UploadZone = loaded.exports.default;
const pdf = { type: 'application/pdf', size: 100, name: 'demo.pdf' };

function renderUploadPage(apiResult) {
  const pageFile = path.resolve(__dirname, '..', 'src', 'pages', 'UploadPage.jsx');
  const pageCode = transformSync(fs.readFileSync(pageFile, 'utf8'), {
    loader: 'jsx', jsx: 'automatic', format: 'cjs', target: 'node20',
  }).code;
  let refetches = 0;
  let navigations = 0;
  const mocks = {
    'react-router-dom': { useNavigate: () => () => { navigations += 1; } },
    '../components/Navbar': () => React.createElement('nav'),
    '../components/UploadZone': UploadZone,
    '../hooks/useTransactions': { useTransactions: () => ({ refetch: async () => { refetches += 1; } }) },
    '../utils/api': { uploadPDF: async () => apiResult },
  };
  const pageModule = new Module(pageFile, module);
  pageModule.filename = pageFile;
  pageModule.paths = Module._nodeModulePaths(path.dirname(pageFile));
  const originalRequire = pageModule.require.bind(pageModule);
  pageModule.require = (id) => mocks[id] || originalRequire(id);
  pageModule._compile(pageCode, pageFile);
  let pageView;
  act(() => { pageView = renderer.create(React.createElement(pageModule.exports.default)); });
  return {
    onUpload: pageView.root.findByType(UploadZone).props.onUpload,
    counts: () => ({ refetches, navigations }),
    unmount: () => act(() => pageView.unmount()),
  };
}

function visibleText(node) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(visibleText).join('');
  return node?.children ? visibleText(node.children) : '';
}

async function upload(onUpload) {
  let view;
  act(() => { view = renderer.create(React.createElement(UploadZone, { onUpload })); });
  const input = view.root.findByType('input');
  await act(async () => {
    input.props.onChange({ target: { files: [pdf] } });
    await Promise.resolve();
  });
  const screen = visibleText(view.toJSON());
  act(() => view.unmount());
  return screen;
}

test('shows new import and skipped duplicate counts', async () => {
  const screen = await upload(async () => ({ success: true, count: 1, skipped: 2 }));
  assert.match(screen, /1 new transaction imported/);
  assert.match(screen, /2 duplicates skipped/);
  assert.match(screen, /Redirecting to dashboard/);
});

test('all-duplicate upload says zero new transactions', async () => {
  const screen = await upload(async () => ({ success: true, count: 0, skipped: 2 }));
  assert.match(screen, /No new transactions imported/);
  assert.match(screen, /2 already existed/);
  assert.doesNotMatch(screen, /Redirecting to dashboard/);
});

test('partial failure is shown as an error rather than success', async () => {
  const screen = await upload(async () => ({ success: false, count: 1, skipped: 0,
    message: '1 imported, 0 skipped; 1 failed.' }));
  assert.match(screen, /Upload failed/);
  assert.match(screen, /1 imported, 0 skipped; 1 failed/);
  assert.doesNotMatch(screen, /Successfully uploaded/);
});

test('upload page does not redirect or refetch on an all-duplicate response', async () => {
  const page = renderUploadPage({ success: true, count: 0, skipped: 2 });
  let result;
  await act(async () => { result = await page.onUpload(pdf); });
  assert.deepEqual(result, { success: true, count: 0, skipped: 2 });
  assert.deepEqual(page.counts(), { refetches: 0, navigations: 0 });
  page.unmount();
});

test('upload page refreshes saved partial rows and rejects the partial response', async () => {
  const page = renderUploadPage({ success: false, count: 1, skipped: 0,
    message: '1 imported, 0 skipped; 1 failed.' });
  let failure;
  await act(async () => { try { await page.onUpload(pdf); } catch (error) { failure = error; } });
  assert.match(failure.message, /1 failed/);
  assert.deepEqual(page.counts(), { refetches: 1, navigations: 0 });
  page.unmount();
});
