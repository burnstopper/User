
# CookieLib
Javascript библиотека для установки и удаления куки, получения токена пользователя. Используется библиотека [js-cookie](https://github.com/js-cookie/js-cookie "js-cookie").

### Включение

#### HTML

```html
<script src=“path to cookielib/index.js"></script>
```

#### React:
Модуль должен находиться в директории “src”. Пропишите

```javascript
import CookieLib from "path to cookielib/index.js"
```
или

```javascript
import { getCookieToken, setCookieToken, removeCookie, CookieFooter } from "path to cookielib/index.js";
```

### Установка куки

Для установки куки используйте функцию `setCookieToken(token)`, в качестве аргумента передайте значение JWT-токена

### Получение токена

Значение токена возвращает `getCookieToken()`, в качестве аргумента передайте значение JWT-токена
1. Если у пользователя уже установлена куки, то функция вернет строку - значение JWT-токена
2. Иначе функция возвращает undefined

### Удаление куки

Для удаления куки используйте `removeCookie()`

### Баннер, уведомляющий об установке куки

#### React:

Пропишите `<CookieLib.CookieFooter/>` последним элементом в `function App()` в файле App.js. Баннер будет отображаться только в том случае, если у пользователя еще не установлены куки.
