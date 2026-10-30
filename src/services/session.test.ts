import reducer, {
  restoreSession,
  signIn,
  signOut,
  saveProfile,
  clearSessionError,
} from './slices/session';

const user = { name: 'Тест', email: 'test@example.com' };

describe('Сессия пользователя', () => {
  test('проверка при старте завершается и для гостя', () => {
    const pending = reducer(undefined, restoreSession.pending('r', undefined));
    expect(pending.checking).toBe(true);
    const state = reducer(pending, restoreSession.fulfilled(null, 'r', undefined));
    expect(state).toMatchObject({ checked: true, checking: false, user: null });
  });
  test('вход сохраняет пользователя, ошибка отображается и сбрасывается', () => {
    const data = { email: user.email, password: 'password' };
    const failed = reducer(
      undefined,
      signIn.rejected(new Error('Неверный пароль'), 'r', data)
    );
    expect(failed.error).toBe('Неверный пароль');
    expect(reducer(failed, clearSessionError()).error).toBeNull();
    const success = reducer(failed, signIn.fulfilled(user, 'r', data));
    expect(success.user).toEqual(user);
    expect(success.checked).toBe(true);
  });
  test('профиль обновляется только после успешного ответа сервера', () => {
    const state = reducer(undefined, restoreSession.fulfilled(user, 'r', undefined));
    const updated = { ...user, name: 'Новое имя' };
    const pending = reducer(state, saveProfile.pending('r', updated));
    expect(pending.user).toEqual(user);
    const success = reducer(pending, saveProfile.fulfilled(updated, 'r', updated));
    expect(success.user).toEqual(updated);
    expect(success.pending).toBe(false);
  });
  test('неудачный выход сохраняет сессию, успешный удаляет', () => {
    const state = reducer(undefined, restoreSession.fulfilled(user, 'r', undefined));
    expect(
      reducer(state, signOut.rejected(new Error('offline'), 'r', undefined)).user
    ).toEqual(user);
    expect(reducer(state, signOut.fulfilled(undefined, 'r', undefined)).user).toBeNull();
  });
});
