
# Simple Wallet — Practice Service for Autotests

This is a "Micro-Banking" educational web application designed specifically for practicing writing autotests with `pytest`, `python+requests` (API), and `playwright` (UI). The application emulates a typical banking system with accounts, transactions, and savings accounts.
NOTE: Please note that the project includes a `.gitlab-ci.yml` file. This is not an error, as the project was originally developed specifically for use with GitLab; it is included here for demonstration purposes (as part of a portfolio).

## 🚀 Key Features

### User Functionality
- **Registration and Authorization**: JWT-based authentication. Upon initial registration, the user receives a welcome balance (1000.00).
- **Personal Account**: View profile, edit username, and check balance.
- **Funds Management**:
  - **Top-up**: Ability to "print" money for testing purposes.
  - **Transfers**: Instant transfers to other users by their `username`.
- **Transaction History**:
  - Filtering by type (incoming/outgoing).
  - Search by description.
  - Transaction categories.
- **Savings (Piggy Banks)**:
  - Creating goal-oriented savings accounts.
  - Transferring funds from the main account to a savings account.
  - Tracking target progress.

### Administrator Functionality (User Management)
- **User List**: View all accounts registered in the system.
- **User Deletion**: Ability to clean up test data.

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS (Modern Dark Mode), Framer Motion (animations).
- **Backend**: Express, Node.js.
- **Database**: PostgreSQL (via Cloud SQL or Docker), Drizzle ORM.
- **API Docs**: Swagger (OpenAPI 3.0).

## 📖 API Testing
Swagger documentation is available at: `/api-docs`

Key endpoint groups:
- `Auth`: Registration and token retrieval.
- `User`: Profile, balance, and user list management.
- `Transactions`: Transfers and history.
- `Savings`: Savings management.

## 🎭 UI Testing
The application is designed for "black-box" testing practice:
- **No data-testid**: Elements must be located by text, roles, or DOM structure.
- **Dynamic States**: Use waiters to handle `motion` animations.
- **Localization**: The interface is fully in Russian.

## 💻 Local Setup (Development)

1. **Environment**:
   - Create a `.env` file (see `.env.example`).
   - Start PostgreSQL (e.g., via Docker Compose in the project root).
2. **Installation**:
   ```bash
   npm install
   ```
3. **Database**:
   ```bash
   npm run db:push
   ```
4. **Execution**:
   ```bash
   npm run dev
   ```

---
*The application runs in a dark mode for comfortable testing in the evening.*

## 📋 API Specification (for Negative Testing)

Use this data to design assertions for boundary values, invalid data types, and logical errors.

### 1. Authentication and Profile
| Method | Endpoint | Parameter | Type | Required | Description / Expected Error |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | `username` | string | Yes | Min 3 characters. Error 400 if the user already exists. |
| `POST` | `/api/auth/register` | `password` | string | Yes | Min 6 characters. Error 400 on empty field. |
| `POST` | `/api/auth/login` | `username` | string | Yes | Error 401 on invalid username/password. |
| `PATCH` | `/api/user/me` | `username` | string | No | Error 400 if the new username is already taken by another user. |

### 2. Transactions and Transfers
| Method | Endpoint | Parameter | Type | Required | Description / Expected Error |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/transactions/transfer` | `toUsername` | string | Yes | Error 404 if the recipient is not found. |
| `POST` | `/api/transactions/transfer` | `amount` | number | Yes | Must be `> 0`. Error 400 on insufficient balance or `amount <= 0`. |
| `POST` | `/api/user/deposit` | `amount` | number | Yes | Error 400 if `amount` is not a positive number. |
| `GET` | `/api/transactions` | `type` | string | No | Valid values: `income`, `expense`. Other values may be ignored or return an empty list. |

### 3. Savings (Piggy Banks)
| Method | Endpoint | Parameter | Type | Required | Description / Expected Error |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/savings` | `targetAmount` | number | Yes | Error 400 if target `<= 0`. |
| `POST` | `/api/savings/:id/deposit` | `amount` | number | Yes | Error 400 if there are insufficient funds on the main account. |

### General Error Rules:
- **401 Unauthorized**: Request without the `Authorization: Bearer <token>` header or with an invalid token.
- **404 Not Found**: Accessing a non-existent resource (e.g., `/api/users/99999`).
- **500 Internal Server Error**: System error (e.g., passing `null` to a required field that is not handled on the backend).



====== RUSSIAN =====================================================
# Simple Wallet — Тренировочный сервис для автотестов

Это учебное веб-приложение "Микро-банкинг", созданное специально для практики написания автотестов на `pytest`, `python+requests` (API) и `playwright` (UI). Приложение эмулирует типичную банковскую систему с аккаунтами, транзакциями и сберегательными счетами.

## 🚀 Основные возможности

### Функционал пользователя
- **Регистрация и Авторизация**: JWT-based аутентификация. При первой регистрации пользователь получает приветственный баланс (1000.00).
- **Личный кабинет**: Просмотр профиля, редактирование username и проверка баланса.
- **Управление средствами**:
  - **Пополнение**: Возможность "напечатать" деньги для тестов.
  - **Переводы**: Мгновенные переводы другим пользователям по их `username`.
- **История транзакций**:
  - Фильтрация по типу (входящие/исходящие).
  - Поиск по описанию.
  - Категории транзакций.
- **Копилки (Savings)**:
  - Создание целевых сберегательных счетов.
  - Перевод средств с основного счета в копилку.
  - Отслеживание прогресса достижения цели.

### Функционал администратора (User Management)
- **Список пользователей**: Просмотр всех зарегистрированных в системе аккаунтов.
- **Удаление пользователей**: Возможность очистки тестовых данных.

## 🛠 Технический стек
- **Frontend**: React 19, Tailwind CSS (Modern Dark Mode), Framer Motion (анимации).
- **Backend**: Express, Node.js.
- **Database**: PostgreSQL (через Cloud SQL или Docker), Drizzle ORM.
- **API Docs**: Swagger (OpenAPI 3.0).

## 📖 Тестирование API
Документация Swagger доступна по адресу: `/api-docs`

Ключевые группы методов:
- `Auth`: Регистрация и получение токена.
- `User`: Профиль, баланс и управление списком пользователей.
- `Transactions`: Переводы и история.
- `Savings`: Управление копилками.

## 🎭 Тестирование UI
Приложение спроектировано для тренировки "черного ящика":
- **Никаких data-testid**: Элементы нужно находить по тексту, ролям или структуре DOM.
- **Динамические состояния**: Используйте ожидания (waiters) для обработки анимаций `motion`.
- **Локализация**: Интерфейс полностью на русском языке.

## 💻 Локальный запуск (Development)

1. **Окружение**:
   - Создайте `.env` файл (см. `.env.example`).
   - Запустите PostgreSQL (например, через Docker Compose в корне проекта).
2. **Установка**:
   ```bash
   npm install
   ```
3. **База данных**:
   ```bash
   npm run db:push
   ```
4. **Запуск**:
   ```bash
   npm run dev
   ```

---
*Приложение работает в темном стиле для комфортного тестирования в вечернее время.*

## 📋 Спецификация API (для негативного тестирования)

Используйте эти данные для составления проверок на граничные значения, невалидные типы данных и логические ошибки.

### 1. Аутентификация и Профиль
| Метод | Эндпоинт | Параметр | Тип | Обязательный | Описание / Ожидаемая ошибка |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | `username` | string | Да | Min 3 символа. Ошибка 400, если пользователь уже существует. |
| `POST` | `/api/auth/register` | `password` | string | Да | Min 6 символов. Ошибка 400 при пустом поле. |
| `POST` | `/api/auth/login` | `username` | string | Да | Ошибка 401 при неверном логине/пароле. |
| `PATCH` | `/api/user/me` | `username` | string | Нет | Ошибка 400, если новый username уже занят другим. |

### 2. Транзакции и Переводы
| Метод | Эндпоинт | Параметр | Тип | Обязательный | Описание / Ожидаемая ошибка |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/transactions/transfer` | `toUsername` | string | Да | Ошибка 404, если получатель не найден. |
| `POST` | `/api/transactions/transfer` | `amount` | number | Да | Должен быть `> 0`. Ошибка 400 при недостаточном балансе или `amount <= 0`. |
| `POST` | `/api/user/deposit` | `amount` | number | Да | Ошибка 400, если `amount` не является положительным числом. |
| `GET` | `/api/transactions` | `type` | string | Нет | Валидные значения: `income`, `expense`. Другие значения могут игнорироваться или возвращать пустой список. |

### 3. Копилки (Savings)
| Метод | Эндпоинт | Параметр | Тип | Обязательный | Описание / Ожидаемая ошибка |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/savings` | `targetAmount` | number | Да | Ошибка 400, если цель `<= 0`. |
| `POST` | `/api/savings/:id/deposit` | `amount` | number | Да | Ошибка 400, если на основном счету недостаточно средств. |

### Общие правила ошибок:
- **401 Unauthorized**: Запрос без заголовка `Authorization: Bearer <token>` или с невалидным токеном.
- **404 Not Found**: Обращение к несуществующему ресурсу (например, `/api/users/99999`).
- **500 Internal Server Error**: Системная ошибка (например, передача `null` в обязательное поле, которое не обработано на бэкенде).
