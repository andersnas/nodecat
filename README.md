<img src="images/logo.png" alt="Node Cat Logo" width="20%" />

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

You can supply HS256 key for signing and PORT for the service to listen on using environment variables:

```
export HS256_KEY=feb0fd6be2dd86279a38f415dd85dbab56c97e3ff589ec7bb04e09c3fd98cb20
export PORT=3000
```

To use environment variables in Docker:
```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e HS256_KEY=feb0fd6be2dd86279a38f415dd85dbab56c97e3ff589ec7bb04e09c3fd98cb20 \
  node-cat
```

## Try it on Open Source As A Service (OSAAS)
Skip the Docker build and run the NodeCat service on OSAAS:

[![Badge OSC](https://img.shields.io/badge/Evaluate-24243B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8yODIxXzMxNjcyKSIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI3IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz4KPGRlZnM%2BCjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8yODIxXzMxNjcyIiB4MT0iMTIiIHkxPSIwIiB4Mj0iMTIiIHkyPSIyNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjQzE4M0ZGIi8%2BCjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzREQzlGRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM%2BCjwvc3ZnPgo%3D)](https://app.osaas.io/browse/andersnas-nodecat)

## Usage

### Generate token (Basic Example)
The simplest example to generate a token with an expiration claim (``exp``):
```
% curl 'http://localhost:3000/generateToken' \       
  -H 'Content-Type: application/json' \
  --data-raw '{"exp":1829693926}'                         

# Example output:
2D3RhEOhAQWhBFBha2FtYWlfa2V5X2hzMjU2U6MEGm0O6eYGGmcZ-KQFGmcZ-KRYIHW-ZKqIAu7x8Z2RISuGYq99maiS2aulzbKLnRiNBgP2
```

### Generate token (Complex Example)
A more complex example, generating a token with a renewable claim (``catr``):
```
% curl 'http://localhost:3000/generateToken' \
  -H 'Content-Type: application/json' \
  --data-raw '{"exp":1829693926,"sub":"TheCatHunter","catr":{"expext":70,"renewabletype":2,"deadline":0}}'

# Example output:
  2D3RhEOhAQWhBFBha2FtYWlfa2V5X2hzMjU2WCqlBBptDunmAmxUaGVDYXRIdW50ZXIZARaiAAIBGEYGGmcZWXoFGmcZWXpYIDWdOGh_yV1OZx6eGrJ7RyjcXZM4FhDS9DGXyHMl_toU
```

### Validate Token:
To validate a token and retrieve its payload:
```
% curl -X POST http://localhost:3000/validateToken \
-H "Content-Type: application/json" \
-d '{"token": "2D3RhEOhAQWhBFBha2FtYWlfa2V5X2hzMjU2WCqlBBptDunmAmxUaGVDYXRIdW50ZXIZARaiAAIBGEYGGmcZWXoFGmcZWXpYIDWdOGh_yV1OZx6eGrJ7RyjcXZM4FhDS9DGXyHMl_toU"}'

# Example output:
{"status":"Token is valid","payload":{"exp":1829693926,"sub":"TheCatHunter","catr":{"renewal_type":2,"exp_extension":70},"iat":1729714554,"nbf":1729714554}}
```

## Key Generation

To use the NodeCat service with proper security, you need to generate cryptographic keys for signing tokens.

### Generate HS256 Key (Using OpenSSL)
To generate a 256-bit HS256 key, run the following command:
```
openssl rand -hex 32

# Example output:
feb0fd6be2dd86279a38f415dd85dbab56c97e3ff589ec7bb04e09c3fd98cb20
```

### Generate Keys Using Node.js
Alternatively, use the provided Node.js script to generate keys:
```
npm install jose
node src/createKeys.js

# Example output:
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

## Testing
You can test the creation and validation of a token in one go using the supplied shell script testToken.sh
```
src/testToken.sh

# Example output:
Creating token...
Token generated: 2D3RhEOhAQWhBFBha2FtYWlfa2V5X2hzMjU2WCqlBBptDunmAmxUaGVDYXRIdW50ZXIZARaiAAIBGEYGGmcaCUgFGmcaCUhYINXqkeJ6TjMsk2gxt6MdBBb1lGnlo7HhWPfa_5wSW-WZ
Validating token...
Token is valid: {"status":"Token is valid","payload":{"exp":1829693926,"sub":"TheCatHunter","catr":{"renewal_type":2,"exp_extension":70},"iat":1729759560,"nbf":1729759560}}
Test completed successfully.
```

## Notes
- **HS256 (HMAC)** is a symmetric algorithm, meaning the same key is used for both signing and validation.
- **ES256 (ECDSA)** is an asymmetric algorithm, using a private key for signing and a public key for validation.
Ensure you are managing your cryptographic keys securely, particularly in production environments.
