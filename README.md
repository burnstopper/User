# Microservice "User"

Микросервис "Пользователь". Бэк создан на основе шаблона для бэкенда с FastAPI. Реализована первая версия микросервиса: возможность анонимной регистрации.

На данный момент доступно 2 метода API:

* POST http://{HOST}:{PORT}/user/new_respondent  --- возвращает зашифрованный токен пользователя.
* GET http://{HOST}:{PORT}/user/{user_token} --- принимает зашифрованный токен пользователя, возвращает его ID. 
  - При истечении срока действия токена возвращается ошибка с кодом 401 и комментарием "Expired token". 
  - При неверном формате токена возвращается ошибка c кодом 403 и комментарием "Invalid token".

После запуска можно посмотреть документацию на страницу http://{HOST}:{PORT}/docs

Конфигурационный файл с переменными окружения должен находиться по пути "User/webserver/code/.env" .
В нём находятся следующие переменные:\
JWT_SECRET="31fb1ffbdc0cabb88c3da5421b83becb"  --- 32-битный секрет для JWT\
JWE_SECRET="b871f1a2a56f19255f881a183853f575"  --- 32-битный секрет для JWT\
JWT_ALGORITHM="HS256" --- алгоритм кодирования JWT\
JWE_ENCRYPTION_ALGORITHM="A256GCM" --- алгоритм шифрования JWE\
SQLALCHEMY_DATABASE_URI="sqlite+aiosqlite://app/storage/user_databases.db" --- путь к базе данных относительно "User/webserver/code"\
TOKEN_EXPIRE_TIME_IN_DAYS=30 --- срок действия токена пользователя в днях\
BEARER_TOKEN="JhbGciOiJIUzI1NiIsInR5I6IkpXVCJ9JzdWIiOiJKdXN0IGFGF2VzcyB0b2tlbiB0byBjb21t5pY2F0ZSB3dGloIFVzIifQ" --- токен доступа, с которым другие сервисы должны посылать запросы\

HOST и PORT настраиваются в файле "User/webserver/code/run.sh" .
