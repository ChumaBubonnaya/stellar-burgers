# Загрузка кода и отправка на проверку

## 1. Объедините принятый предыдущий этап

PR https://github.com/ChumaBubonnaya/stellar-burgers/pull/2 уже одобрен
ревьюером, но на момент подготовки архива ещё открыт. Владельцу репозитория
нужно открыть его и нажать **Merge pull request**, затем **Confirm merge**.

Так новый PR будет содержать изменения только этапа тестирования, как требует
задание. Выполните объединение до следующего шага.

## 2. Сделайте свежую локальную копию

Откройте терминал в папке, где хотите хранить проект, и выполните:

```bash
git clone --branch main https://github.com/ChumaBubonnaya/stellar-burgers.git stellar-burgers-submission
cd stellar-burgers-submission
git switch -c review
```

Это инструкция для новой копии: локальная ветка `review` создаётся от уже
обновлённой `main`. Выполнять команды должен владелец репозитория или участник
с правом записи. Если папка `stellar-burgers-submission` уже существует,
выберите новое имя папки при клонировании.

## 3. Скопируйте код из архива

Распакуйте архив. Откройте внутри него папку `stellar-burgers` и скопируйте
**её содержимое** в `stellar-burgers-submission`, соглашаясь на замену файлов.
Скопируйте и служебные файлы, например `.gitignore` и `.env.example`.

В итоге `package.json`, `src` и `tests` должны находиться непосредственно
в `stellar-burgers-submission`. Дополнительной вложенной папки
`stellar-burgers-submission/stellar-burgers` быть не должно.

Папка `.git`, созданная клонированием, должна остаться на месте.
В архиве нет `.git`, `node_modules`, локального `.env` и результатов запусков.

## 4. Установите зависимости и проверьте

В терминале в папке `stellar-burgers-submission` выполните:

```bash
npm ci
npx playwright install chromium
npm run typecheck
npm run check
npm run test:coverage
npm run e2e
npm run build
```

Ожидаемый результат: 40 тестов Jest и 10 сценариев Playwright проходят.
Отдельно запускать `npm start` перед `npm run e2e` не нужно.
Подробности тестов описаны в `TESTING.md`.

## 5. Отправьте изменения в GitHub

```bash
git status
git diff --stat
git add .
git commit -m "test: cover catalog reducers and burger ordering"
git push -u origin review
```

После объединения предыдущего PR обычного `git push` достаточно. Если Git
отклонит отправку из-за новых чужих коммитов, сначала синхронизируйте изменения;
не используйте принудительный push.

## 6. Создайте новый pull request

Откройте https://github.com/ChumaBubonnaya/stellar-burgers/compare/main...review
и проверьте:

- **base:** `main`;
- **compare:** `review`;
- во вкладке **Files changed** находятся только изменения этого этапа.

Нажмите **Create pull request**. Возможный заголовок:
`Тестирование Stellar Burgers: Jest и Playwright`.

Описание:

> Добавлены тесты редьюсеров каталога и конструктора, проверки rootReducer и
> браузерные сценарии конструктора, модальных окон и оформления заказа.
> Ответы API воспроизводятся из HAR. Jest: 40 тестов, покрытие catalog и builder
> 100%. Playwright: 10 сценариев. Проверены типы, линтеры и сборка.

Скопируйте HTTPS-ссылку **на созданный PR**, вида
`https://github.com/ChumaBubonnaya/stellar-burgers/pull/НОВЫЙ_НОМЕР`,
и отправьте её через форму сдачи проекта в Практикуме.

При замечаниях ревьюера вносите изменения в эту же ветку `review` и отправляйте
на повторную проверку ссылку на тот же новый PR.
