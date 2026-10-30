import { fetchWithRefresh, getIngredientsApi } from './burger-api';

const response = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string): string | null => values.get(key) ?? null,
      setItem: (key: string, value: string): void => {
        values.set(key, value);
      },
      removeItem: (key: string): void => {
        values.delete(key);
      },
    },
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { cookie: '' },
  });
});
afterEach(() => {
  jest.restoreAllMocks();
});

test('API с success=false отклоняет запрос даже при HTTP 200', async () => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(response({ success: false, message: 'Ошибка сервера' }));
  await expect(getIngredientsApi()).rejects.toThrow('Ошибка сервера');
});

test('истёкший токен обновляется, исходный запрос повторяется с новым заголовком', async () => {
  localStorage.setItem('refreshToken', 'refresh-old');
  const fetchMock = jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(response({ message: 'jwt expired' }, 403))
    .mockResolvedValueOnce(
      response({
        success: true,
        accessToken: 'Bearer fresh',
        refreshToken: 'refresh-new',
      })
    )
    .mockResolvedValueOnce(response({ success: true, result: 42 }));
  await expect(
    fetchWithRefresh('https://example.test/orders', {
      headers: { authorization: 'Bearer old' },
    })
  ).resolves.toEqual({ success: true, result: 42 });
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(new Headers(fetchMock.mock.calls[2][1]?.headers).get('authorization')).toBe(
    'Bearer fresh'
  );
  expect(localStorage.getItem('refreshToken')).toBe('refresh-new');
});

test('сетевая ошибка сохраняет исходное сообщение', async () => {
  jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Соединение прервано'));
  await expect(fetchWithRefresh('https://example.test/orders', {})).rejects.toThrow(
    'Соединение прервано'
  );
});
