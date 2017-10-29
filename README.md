# DOMjudge with React

## 개요

* React를 이용한 DOMjudge front-end 개발
* 완벽한 기능 구현을 위해 DOMjudge api 대신 express를 통한 api 서버 구축
* location 이동이 전혀 없는 application 구축이 목표
* (대회에 필요는 없을 수 있지만) 최대한 responsive 지향
* DOMjudge에 없는 기능들 구현 (제출한 파일 보기, submission 결과 알림, 새로운 clarification 알림)

## 설치

```bash
npm i && cd client && npm i && cd ..

npm start
```

## ESLint 확인

```bash
npm run lint

cd client
npm run lint
```

## API server config

```bash
vim config.js
```

## Client 빌드

```bash
cd client
npm run build
```

## Client 빌드 이후 production으로 서버 실행

```bash
NODE_ENV=production PORT=3000 node server.js
```

## Apache2를 통한 proxy 설정

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
```

```
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so

RedirectMatch ^/react$ /react/
ProxyPass "/react/" "http://localhost:3000/"
ProxyPassReverse "/react/" "http://localhost:3000/"
```

## 도움이 됐던 사이트들

[Create-react-app with express api](https://github.com/fullstackreact/food-lookup-demo)
