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
  ![Компоненты микросервиса инцидентов](https://github.com/user-attachments/assets/d9a986e4-1318-444c-9911-124af2d77d3c)

## Ссылки

- #### Клиентская часть:  *https://github.com/ByeLarry/incidents-frontend*
- #### API-шлюз:  *https://github.com/ByeLarry/incidents-gateway*
- #### Сервис авторизации:  *https://github.com/ByeLarry/incidents-auth-service*
- #### Сервис поиска *https://github.com/ByeLarry/incidents-search-service*
- #### Панель администратора *https://github.com/ByeLarry/incidents-admin-frontend.git*
- #### Демонастрация функционала пользовательской части версии 0.1.0: *https://youtu.be/H0-Qg97rvBM*
- #### Демонастрация функционала пользовательской части версии 0.2.0: *https://youtu.be/T33RFvfTxNU*
- #### Демонастрация функционала панели администратора версии 0.1.0: *https://youtu.be/7LTnEMYuzUo*



