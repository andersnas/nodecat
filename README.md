# NodeCat
A port of Akamais Edgeworker CAT implementation (https://github.com/akamai/edgeworkers-examples/tree/master/delivery/media/cat) to NodeJS.

Not all claims are supported.


# NodeCat Service

Provides a backend with endpoint to create and verify common access tokens.

## Docker

```
docker build -t node-cat .
docker run -p 3000:3000 node-cat
```

## Usage

Generate token:

```
% curl 'http://localhost:3000/generateToken' \
  -H 'Content-Type: application/json' \
  --data-raw '{"exp":1829693926,"sub":"TheCatHunter","catr":{"expext":70,"renewabletype":2,"deadline":0}}'

  2D3RhEOhAQWhBFBha2FtYWlfa2V5X2hzMjU2WCqlBBptDunmAmxUaGVDYXRIdW50ZXIZARaiAAIBGEYGGmcZWXoFGmcZWXpYIDWdOGh_yV1OZx6eGrJ7RyjcXZM4FhDS9DGXyHMl_toU
```

Validate Token:

```
% curl -X POST http://localhost:3000/validateToken \
-H "Content-Type: application/json" \
-d '{"token": "2D3RhEOhAQWhBFBha2FtYWlfa2V5X2hzMjU2WCqlBBptDunmAmxUaGVDYXRIdW50ZXIZARaiAAIBGEYGGmcZWXoFGmcZWXpYIDWdOGh_yV1OZx6eGrJ7RyjcXZM4FhDS9DGXyHMl_toU"}'

{"status":"Token is valid","payload":{"exp":1829693926,"sub":"TheCatHunter","catr":{"renewal_type":2,"exp_extension":70},"iat":1729714554,"nbf":1729714554}}
```
