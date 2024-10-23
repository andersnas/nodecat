# nodecat
A port of Akamais CAT implementation (https://github.com/akamai/edgeworkers-examples/tree/master/delivery/media/cat) into NodeJS


# NodeCat Service

Provides a backend with endpoint to create and verify common access tokens.

## Install

```
npm install
```

## Run
```
npm start
```

## Docker

```
docker build -t nodecat-svc:dev .
docker run --rm -d \
  -p 8000:8000 nodecat-svc:dev
```

## Usage

Get Captcha:

```
% curl http://localhost:8000/gettoken
{"token":"1234567890"}
```

Verify Token:

Correct token:
```
% curl -v http://localhost:8000/verifytoken
< HTTP/1.1 200 OK
< vary: Origin
< access-control-allow-origin: *
< content-type: application/json; charset=utf-8
< content-length: 32
< Date: Thu, 03 Oct 2024 14:41:33 GMT
< Connection: keep-alive
< Keep-Alive: timeout=72
< 
* Connection #0 to host localhost left intact
{"message":"Captcha is correct"}
```



## Example Javascript

Example implementation in Javascript

```javascript

```
