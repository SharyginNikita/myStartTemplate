# myStartTemplate
Start template (Gulp + Webpack) for Pug, SCSS, JS, Vue

# О шаблоне / About template
* именование классов по [БЭМ](https://ru.bem.info/) / [BEM](https://en.bem.info/) class naming
* используются препроцессоры / used [Pug](https://pugjs.org/) и [dart SCSS](https://sass-scss.ru/dart-sass/) / and [dart SCSS](https://sass-lang.com/dart-sass)
* используется транспайлер / used JavaSCript compiler [Babel](https://babeljs.io/)
* используется / used [Webpack](https://webpack.js.org/) для сборки JavaScript и Vue компонентов / for JavaScript and Vue components
* Используется / used [gulp-pug-linter](https://www.npmjs.com/package/gulp-pug-linter), [EsLint](https://eslint.org/)

## Установка / Install
* установите / install [NodeJS](https://nodejs.org/en/) и / and [Yarn](https://yarnpkg.com/en/docs/install) (если требуется) / (if you need)
* установите / install [Git](https://gicm.com/downloads) и перейдите на репозиторий шаблона / and open template repository ````https://github.com/SharyginNikita/myStartTemplate.git````
* нажмите на кнопку / press on button ````use this template```` (Также вы можете форкнуть репозиторий / aslo you can fork repository)
* склонируйте репозиторий используя SSH ключ (рекомендуется) / clone repository used SHH key (recommended)````git@github.com:SharyginNikita/myStartTemplate.git````
* перейдите в скачанную папку со сборкой: / change directory on template ````cd myStartTemplate````
* инициализируйте репозиторий / init repository ````yarn init````
* скачайте необходимые зависимости: / download required dependencies ````yarn````
* чтобы начать работу, введите команду: / start work use command ````yarn gulp````

## Команды / Command
* ````yarn gulp```` (Сборка и запуск сервера в режиме development / Build & run server in development mode)
* ````yarn gulp --prod```` (Сборка в режиме production / Build & run server in production mode)
* ````yarn gulp build-dev```` (Сборка в режиме development / Build in development mode)
* ````yarn gulp build-prod```` (Сборка в режиме production / Build in production mode)
* ````yarn gulp testPug```` линтинг Pug файлов / lint Pug files
* ````yarn gulp clear```` удалить все / delete all html, css, js, img файлы из соответсвующих папок / files from them folder (смотреть / check gulpfile.js и / and config.js)
* Отдельные таски можно посмотреть в / other task you can see in gulpfile.js

## Дополнительная информация / Info
* Pug миксин много-уровнего меню / Pug mixin multi level menu  src/templates/mixins/menuList-mixin.pug (Документация внутри / documentation in file)
* Используется / used dart sass
* SCSS Lint Task был удален так как gulp-sass-lint на данный момент не поддерживает dart-sass / was deleted because gulp-sass-lint doesn't support dart-sass
* EsLint выполняется при сборке JavaScript файлов / EsLint works when builds JavaScript files
* Все пути указываются в файле / all path set in  file config.js


## Задачи / My task
* добавить / add unit тесты для / test for JavaScript
* добавить / add vue-lint
* добавить поддержку / add support TypeScript
* добавить сборку спрайтов / add sprite build






