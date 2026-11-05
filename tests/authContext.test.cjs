const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const { transformSync } = require('esbuild');
const renderer = require('react-test-renderer');
const { act } = renderer;
const { MemoryRouter, Routes, Route } = require('react-router-dom');

const storage = new Map();
const authAPI = { register: null, login: null, getMe: null };
const api = {
  authAPI,
  getToken: () => storage.get('token') || null,
  setToken: (token) => storage.set('token', token),
  removeToken: () => storage.delete('token'),
  getStoredUser: () => storage.get('user') || null,
  setStoredUser: (user) => storage.set('user', user),
  removeStoredUser: () => storage.delete('user'),
};

function loadJsx(relative, mocks) {
  const filename = path.resolve(__dirname, '..', relative);
  const source = fs.readFileSync(filename, 'utf8');
  const code = transformSync(source, { loader: 'jsx', jsx: 'automatic', format: 'cjs', target: 'node20' }).code;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = (id) => mocks[id] || originalRequire(id);
  loaded._compile(code, filename);
  return loaded.exports;
}

const auth = loadJsx('src/context/AuthContext.jsx', { '../utils/api': api });
const ProtectedRoute = loadJsx('src/components/ProtectedRoute.jsx', {
  '../context/AuthContext': auth,
}).default;
let current;
let view;

function Probe() {
  current = auth.useAuth();
  return React.createElement('span', null, current.loading ? 'Loading' : 'Ready');
}

function render(entry = '/dashboard') {
  const element = React.createElement(auth.AuthProvider, null,
    React.createElement(Probe),
    React.createElement(MemoryRouter, { initialEntries: [entry] },
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/dashboard', element: React.createElement(ProtectedRoute, null,
          React.createElement('div', null, 'Dashboard access')) }),
        React.createElement(Route, { path: '/auth', element: React.createElement('div', null, 'Auth screen') })
      )
    )
  );
  act(() => { view = renderer.create(element); });
  return () => JSON.stringify(view.toJSON());
}

async function flush() {
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
}

test.beforeEach(() => {
  storage.clear();
  current = null;
  view = null;
  authAPI.getMe = async () => ({ user: { name: 'Verified' } });
  authAPI.register = async () => ({ token: 'new-token', user: { name: 'Registered' } });
  authAPI.login = async () => ({ token: 'login-token', user: { name: 'Logged in' } });
});

test.afterEach(() => {
  if (view) act(() => view.unmount());
});

test('registration stores the session and clears loading', async () => {
  const screen = render('/auth');
  await act(async () => { await current.register('Registered', 'demo@example.com', 'secret'); });
  assert.equal(storage.get('token'), 'new-token');
  assert.deepEqual(storage.get('user'), { name: 'Registered' });
  assert.equal(current.isAuthenticated, true);
  assert.equal(current.loading, false);
  assert.match(screen(), /Auth screen/);
});

test('login stores the session and clears loading', async () => {
  render('/auth');
  await act(async () => { await current.login('demo@example.com', 'secret'); });
  assert.equal(storage.get('token'), 'login-token');
  assert.equal(current.isAuthenticated, true);
  assert.equal(current.loading, false);
});

test('cached user waits for token verification before dashboard access', async () => {
  storage.set('token', 'cached-token');
  storage.set('user', { name: 'Cached' });
  let complete;
  authAPI.getMe = () => new Promise((resolve) => { complete = resolve; });
  const screen = render();
  assert.match(screen(), /Loading/);
  assert.doesNotMatch(screen(), /Dashboard access/);
  await act(async () => { complete({ user: { name: 'Verified' } }); });
  assert.match(screen(), /Dashboard access/);
  assert.deepEqual(storage.get('user'), { name: 'Verified' });
});

test('token without cached user restores the session', async () => {
  storage.set('token', 'cached-token');
  const screen = render();
  await flush();
  assert.match(screen(), /Dashboard access/);
  assert.equal(current.loading, false);
});

test('a guest is redirected away from the protected dashboard', () => {
  const screen = render();
  assert.match(screen(), /Auth screen/);
  assert.doesNotMatch(screen(), /Dashboard access/);
});

test('logout clears credentials and blocks the dashboard', async () => {
  storage.set('token', 'cached-token');
  storage.set('user', { name: 'Cached' });
  const screen = render();
  await flush();
  act(() => current.logout());
  assert.equal(storage.has('token'), false);
  assert.equal(storage.has('user'), false);
  assert.match(screen(), /Auth screen/);
  assert.equal(current.loading, false);
});

test('an expired token clears the session and redirects to auth', async () => {
  storage.set('token', 'expired-token');
  storage.set('user', { name: 'Cached' });
  authAPI.getMe = async () => { throw new Error('Unauthorized'); };
  const screen = render();
  await flush();
  assert.equal(storage.has('token'), false);
  assert.equal(current.loading, false);
  assert.match(screen(), /Auth screen/);
});

test('a late verification response cannot restore a logged-out session', async () => {
  storage.set('token', 'cached-token');
  storage.set('user', { name: 'Cached' });
  let complete;
  authAPI.getMe = () => new Promise((resolve) => { complete = resolve; });
  const screen = render();
  act(() => current.logout());
  await act(async () => { complete({ user: { name: 'Late' } }); });
  assert.equal(storage.has('token'), false);
  assert.match(screen(), /Auth screen/);
});

test('an unreachable auth server stops loading after the timeout', async () => {
  storage.set('token', 'cached-token');
  storage.set('user', { name: 'Cached' });
  authAPI.getMe = () => new Promise(() => {});
  const screen = render();
  assert.match(screen(), /Loading/);
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 5100)); });
  assert.equal(storage.has('token'), false);
  assert.equal(current.loading, false);
  assert.match(screen(), /Auth screen/);
});

test('registration failure leaves the user signed out and exposes the error', async () => {
  authAPI.register = async () => { throw new Error('Registration failed'); };
  render('/auth');
  await act(async () => {
    await assert.rejects(current.register('Demo', 'demo@example.com', 'secret'), /Registration failed/);
  });
  assert.equal(current.isAuthenticated, false);
  assert.equal(current.error, 'Registration failed');
  assert.equal(current.loading, false);
});

test('login failure leaves the user signed out and exposes the error', async () => {
  authAPI.login = async () => { throw new Error('Wrong password'); };
  render('/auth');
  await act(async () => {
    await assert.rejects(current.login('demo@example.com', 'wrong'), /Wrong password/);
  });
  assert.equal(current.isAuthenticated, false);
  assert.equal(current.error, 'Wrong password');
  assert.equal(current.loading, false);
});
