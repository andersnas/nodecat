# NodeCat

NodeCat is a Node.js port of Akamai's Edgeworker CAT (Common Access Token) implementation. It provides backend endpoints to **create** and **validate** Common Access Tokens (CAT) using industry-standard cryptographic algorithms such as **HS256** and **ES256**.

## Key Features
- **Token Generation**: Supports creating Common Access Tokens with custom claims such as expiration, subject, and renewable properties.
- **Token Validation**: Supports validating generated tokens to ensure their authenticity and validity.
- **Multiple Algorithms**: Supports both symmetric (**HS256**) and asymmetric (**ES256**) cryptographic signing algorithms.
  
This implementation is based on [Akamai’s Edgeworker CAT example](https://github.com/akamai/edgeworkers-examples/tree/master/delivery/media/cat), adapted for local Node.js environments.

## NodeCat Service

The service exposes two main endpoints:
- **/generateToken**: Generates a Common Access Token with the provided claims.
- **/validateToken**: Validates a provided CAT token and returns the decoded payload.

### Limitations
- Not all claims from the original Edgeworker implementation are currently supported.
- The `/generateToken` endpoint defaults to **HS256** for signing tokens unless manually configured for **ES256**.

## Docker

To build and run the NodeCat service using Docker:

```bash
docker build -t node-cat .
docker run -p 3000:3000 node-cat
```

## Usage

Generate token (the smallest token you can create)
```
% curl 'http://localhost:3000/generateToken' \       
  -H 'Content-Type: application/json' \
  --data-raw '{"exp":1829693926}'                         

# Example output:
2D3RhEOhAQWhBFBha2FtYWlfa2V5X2hzMjU2U6MEGm0O6eYGGmcZ-KQFGmcZ-KRYIHW-ZKqIAu7x8Z2RISuGYq99maiS2aulzbKLnRiNBgP2
```

Generate a somewhat more complex token
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

### Generate keys

To use the code, please make sure to generate your own keys and insert them into the code.

By using OpenSSL
```
openssl rand -hex 32

feb0fd6be2dd86279a38f415dd85dbab56c97e3ff589ec7bb04e09c3fd98cb20
```

By using the supplied Node.js script
```
npm install jose
node src/createKeys.js

HS256 Key: feb0fd6be2dd86279a38f415dd85dbab56c97e3ff589ec7bb04e09c3fd98cb20

ES256 Private Key (PEM): 
-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgZ6lvYoS0124WXH9F
LVMvCpglnrTOSNcycUDRIsxtKrihRANCAASbmVJ/LMW+BHkWoX4/ZdLxIAwDfb0d
P+XKDFozQHpJoo+9aIsWzjjyr/p5zPP6VBJwrz6nzql5IB8VSITnHayA
-----END PRIVATE KEY-----

ES256 Public Key (PEM): 
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEm5lSfyzFvgR5FqF+P2XS8SAMA329
HT/lygxaM0B6SaKPvWiLFs448q/6eczz+lQScK8+p86peSAfFUiE5x2sgA==
-----END PUBLIC KEY-----
```

To have the tokenManager picking up the key, you can supply it as a environment variable
```
export HS256_KEY=feb0fd6be2dd86279a38f415dd85dbab56c97e3ff589ec7bb04e09c3fd98cb20
```
