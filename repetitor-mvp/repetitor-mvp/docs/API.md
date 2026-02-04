# 📚 API Документация - Репетитор Под Рукой

## 🌐 Base URL

```
Development: http://localhost:4000/api
Production: https://api.repetitor-pod-rukoy.ru/api
```

---

## 🔐 Аутентификация

Все защищённые эндпоинты требуют JWT токен в заголовке:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📍 Endpoints

### Authentication

#### POST `/auth/register`

Регистрация нового пользователя.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "Иван Иванов",
  "role": "STUDENT"  // или "PARENT"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx",
    "email": "student@example.com",
    "name": "Иван Иванов",
    "role": "STUDENT",
    "profile": {
      "grade": 1,
      "voiceGender": "female"
    },
    "subscription": {
      "plan": "FREE",
      "status": "TRIAL"
    }
  }
}
```

#### POST `/auth/login`

Вход пользователя.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:** То же что и в `/auth/register`

#### GET `/auth/me`

Получить текущего пользователя.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "user": {
    "id": "clxxx",
    "email": "student@example.com",
    "name": "Иван Иванов",
    "role": "STUDENT",
    "profile": {...},
    "subscription": {...}
  }
}
```

---

### AI Репетитор

#### POST `/ai/chat`

Отправить сообщение AI-репетитору.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request:**
```json
{
  "message": "Объясни теорему Пифагора",
  "subject": "Математика",
  "grade": 8,
  "outputMode": "text"  // "text" | "voice" | "both"
}
```

**Response:**
```json
{
  "text": "Отлично! Давай разберём теорему Пифагора. Она говорит, что в прямоугольном треугольнике...",
  "confidence": 0.95,
  "needsReview": false
}
```

**Примечания:**
- `confidence`: уровень уверенности AI (0.0 - 1.0)
- `needsReview`: требуется ли проверка ответа человеком
- История разговора автоматически сохраняется

#### GET `/ai/subjects`

Получить список доступных предметов.

**Response:**
```json
{
  "subjects": [
    { "id": "math", "name": "Математика", "icon": "📐" },
    { "id": "russian", "name": "Русский язык", "icon": "📖" },
    { "id": "english", "name": "Английский язык", "icon": "🇬🇧" },
    { "id": "physics", "name": "Физика", "icon": "⚡" },
    { "id": "chemistry", "name": "Химия", "icon": "🧪" },
    { "id": "biology", "name": "Биология", "icon": "🧬" },
    { "id": "history", "name": "История", "icon": "🌍" },
    { "id": "literature", "name": "Литература", "icon": "📚" },
    { "id": "french", "name": "Французский язык", "icon": "🇫🇷" }
  ]
}
```

#### GET `/ai/history/:subject`

Получить историю диалогов по предмету.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "history": [
    {
      "id": "clxxx",
      "userMessage": "Объясни теорему Пифагора",
      "aiResponse": "Отлично! Давай разберём...",
      "confidence": 0.95,
      "timestamp": "2026-02-01T12:00:00.000Z"
    }
  ]
}
```

---

### Поддержка

#### POST `/support/message`

Отправить сообщение в AI-поддержку.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request:**
```json
{
  "message": "Как изменить пароль?"
}
```

**Response:**
```json
{
  "response": "Чтобы изменить пароль, перейдите в Настройки → Безопасность → Сменить пароль. Нужно будет ввести старый пароль и дважды новый. 🔐",
  "resolved": true,
  "escalated": false
}
```

**Если проблема эскалирована:**
```json
{
  "response": "Я передам вашу проблему специалисту. Мы свяжемся с вами в ближайшее время.",
  "resolved": false,
  "escalated": true
}
```

#### GET `/support/history`

Получить историю обращений в поддержку.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "history": [
    {
      "id": "clxxx",
      "role": "USER",
      "content": "Как изменить пароль?",
      "createdAt": "2026-02-01T12:00:00.000Z"
    },
    {
      "id": "clyyy",
      "role": "ASSISTANT",
      "content": "Чтобы изменить пароль...",
      "createdAt": "2026-02-01T12:00:05.000Z"
    }
  ]
}
```

#### GET `/support/tickets`

Получить тикеты пользователя.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "tickets": [
    {
      "id": "clxxx",
      "category": "technical",
      "severity": "medium",
      "status": "OPEN",
      "problem": "Не могу войти в аккаунт",
      "createdAt": "2026-02-01T12:00:00.000Z"
    }
  ]
}
```

---

### Родительская панель

#### GET `/parent/children`

Получить список детей родителя.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "children": [
    {
      "id": "clxxx",
      "userId": "clyyyy",
      "name": "Иван",
      "grade": 7,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/parent/activity/:childId`

Получить активность ребёнка.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "child": {
    "id": "clyyyy",
    "name": "Иван",
    "grade": 7
  },
  "stats": {
    "totalInteractions": 45,
    "totalTime": 3600,
    "subjectsStudied": 3,
    "subjects": ["Математика", "Русский язык", "Физика"]
  },
  "recentActivity": [
    {
      "id": "clxxx",
      "subject": "Математика",
      "userMessage": "Как решить квадратное уравнение?",
      "timestamp": "2026-02-01T12:00:00.000Z"
    }
  ],
  "progress": [...]
}
```

#### POST `/parent/link-child`

Привязать ребёнка к родителю.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request:**
```json
{
  "childUserId": "clyyyy",
  "name": "Иван",
  "grade": 7
}
```

**Response:**
```json
{
  "child": {
    "id": "clxxx",
    "parentId": "clzzzz",
    "userId": "clyyyy",
    "name": "Иван",
    "grade": 7
  }
}
```

---

## ⚠️ Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request - невалидные данные |
| 401 | Unauthorized - не авторизован |
| 403 | Forbidden - нет доступа |
| 404 | Not Found - не найдено |
| 429 | Too Many Requests - превышен лимит |
| 500 | Internal Server Error |

**Пример ошибки:**
```json
{
  "error": "Не удалось получить ответ от AI"
}
```

---

## 🔒 Rate Limits

- **API запросы:** 100 запросов / 15 минут
- **AI запросы:** 50 запросов / 1 час

При превышении лимита:
```json
{
  "error": "Слишком много запросов, попробуйте позже"
}
```

---

## 📡 WebSocket Events

### Подключение

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
```

### Родительские уведомления

#### Присоединиться к комнате родителя
```javascript
socket.emit('join_parent_room', { userId: 'parent_user_id' });
```

#### События от сервера
```javascript
socket.on('child_activity', (data) => {
  console.log('Активность ребёнка:', data);
  // {
  //   childId: 'clxxx',
  //   childName: 'Иван',
  //   action: 'Начал урок по Математике',
  //   timestamp: '2026-02-01T12:00:00.000Z'
  // }
});

socket.on('child_achievement', (data) => {
  console.log('Достижение:', data);
  // {
  //   childName: 'Иван',
  //   achievement: 'Первая неделя без пропусков!',
  //   icon: '🏆'
  // }
});
```

---

## 🧪 Примеры использования

### JavaScript / Fetch

```javascript
// Регистрация
const register = async () => {
  const response = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
      name: 'Тест Тестов'
    })
  });
  
  const data = await response.json();
  const token = data.token;
  localStorage.setItem('token', token);
};

// AI чат
const askAI = async (question) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4000/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: question,
      subject: 'Математика',
      grade: 8,
      outputMode: 'text'
    })
  });
  
  const data = await response.json();
  console.log('AI ответ:', data.text);
};
```

### Python / requests

```python
import requests

# Регистрация
def register():
    response = requests.post(
        'http://localhost:4000/api/auth/register',
        json={
            'email': 'test@example.com',
            'password': 'password123',
            'name': 'Тест Тестов'
        }
    )
    data = response.json()
    return data['token']

# AI чат
def ask_ai(token, question):
    response = requests.post(
        'http://localhost:4000/api/ai/chat',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'message': question,
            'subject': 'Математика',
            'grade': 8,
            'outputMode': 'text'
        }
    )
    data = response.json()
    print('AI ответ:', data['text'])
```

---

## 🎯 Best Practices

1. **Всегда проверяйте статус ответа**
2. **Обрабатывайте ошибки gracefully**
3. **Используйте токен в защищённом месте**
4. **Не превышайте rate limits**
5. **Логируйте важные события**

---

**Документация обновлена:** 01.02.2026
