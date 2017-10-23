# DOMJudge with React

## 개요

* React를 이용한 DOMJudge front-end 개발
* DOMJudge api에서 부족한 기능들과 로그인 등의 구현을 위해 express를 통한 api 서버 구축

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
