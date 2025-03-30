# Сервис точек (инцидентов)

## Описание

Данный репозиторий содержит реализацию микросервиса точек (инцидентов), входящего в состав проекта ***incidents***.
Этот сервис нужен для хранения и обработки созданных пользователями точек на карте. В базе данных хранятся данные с информацией о происшествиях.
В качестве CУБД был выбран PostgreSQL. Для определения ближайшых точек используется расширение PostGIS.
Связь с API-шлюзом осуществляется через WebSocket.

## Установка

### Локально
```bash
# Установка зависимостей
npm install

# Запуск в dev режиме
npm run start:dev
```

### Docker 
```bash
# Создание и запуск docker сервисов
docker-compose up -d
```

## Миграции

#### Команды для управления миграциями
```bash
# Создание миграции
npm run migration:generate src/migrations/<migrationName>

# Выполнение всех миграций
npm run migration:run

# Откат последней миграции
npm run migration:down

# Создание пустой миграции
npm run migration:create src/migrations/<migrationName>
```

## Проектирование

_Диаграммы можно сохранять и редактировать в ***[draw.io](https://app.diagrams.net/)***_
  
- ### ER-диагрмма
  ![Отношение сущностей (происшествия)](https://github.com/user-attachments/assets/eeb6960d-f783-49f9-b6c7-cffd74f5d544)

- ### Компоненты микросервиса инцидентов
  ![Компоненты микросервиса инцидентов](https://github.com/user-attachments/assets/ff644bb2-a922-40ff-9078-86cbc44a89ac)

## Ссылки

### Репозитории
- #### Клиентская часть:  *https://github.com/ByeLarry/incidents-frontend*  [![incidents-frontend](https://github.com/ByeLarry/incidents-frontend/actions/workflows/incidents-frontend.yml/badge.svg)](https://github.com/ByeLarry/incidents-frontend/actions/workflows/incidents-frontend.yml)
- #### API-шлюз:  *https://github.com/ByeLarry/incidents-gateway*  [![incidents-gateway](https://github.com/ByeLarry/incidents-gateway/actions/workflows/incidents-gateway.yml/badge.svg)](https://github.com/ByeLarry/incidents-gateway/actions/workflows/incidents-gateway.yml)
- #### Сервис авторизации:  *https://github.com/ByeLarry/incidents-auth-service*  [![incidents-auth](https://github.com/ByeLarry/incidents-auth-service/actions/workflows/incidents-auth.yml/badge.svg)](https://github.com/ByeLarry/incidents-auth-service/actions/workflows/incidents-auth.yml)
- #### Сервис марок (инцидентов): *https://github.com/ByeLarry/indcidents-marks-service*  [![incidents-marks](https://github.com/ByeLarry/incidents-marks-service/actions/workflows/incidents-marks.yml/badge.svg)](https://github.com/ByeLarry/incidents-marks-service/actions/workflows/incidents-marks.yml)
- #### Сервис поиска *https://github.com/ByeLarry/incidents-search-service*  [![incidents-search](https://github.com/ByeLarry/incidents-search-service/actions/workflows/incidents-search.yml/badge.svg)](https://github.com/ByeLarry/incidents-search-service/actions/workflows/incidents-search.yml)
- #### Панель администратора *https://github.com/ByeLarry/incidents-admin-frontend.git*  [![incidents-admin-frontend](https://github.com/ByeLarry/incidents-admin-frontend/actions/workflows/incidents-admin-frontend.yml/badge.svg)](https://github.com/ByeLarry/incidents-admin-frontend/actions/workflows/incidents-admin-frontend.yml)
- #### Сервис мониторинга состояния системы: *https://github.com/ByeLarry/incidents-healthcheck*  [![incidents-healthcheck](https://github.com/ByeLarry/incidents-healthcheck/actions/workflows/incidents-healthcheck.yml/badge.svg)](https://github.com/ByeLarry/incidents-healthcheck/actions/workflows/incidents-healthcheck.yml)
- #### Telegram бот для уведомления о состоянии системы *https://github.com/ByeLarry/incidents-healthcheck-bot*
- #### Сквозные (end-to-end) тесты *https://github.com/ByeLarry/incidents-playwright*

### Демонстрация функционала
- #### Демонстрация функционала пользовательской части версии 0.1.0: *https://youtu.be/H0-Qg97rvBM*
- #### Демонстрация функционала пользовательской части версии 0.2.0: *https://youtu.be/T33RFvfTxNU*
- #### Демонстрация функционала панели администратора версии 0.1.0: *https://youtu.be/7LTnEMYuzUo*
- #### Демонстрация функционала сервиса мониторинга состояния системы (панель администратора 0.1.1) *https://youtu.be/TeEc9W89igI*



