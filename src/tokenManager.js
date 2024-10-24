import http from 'http';
import { TextEncoder, TextDecoder } from 'util';
import crypto from 'crypto';
import base64url from 'base64url';
import { CWTGenerator, CWTValidator, CWTUtil } from './cwt.js';
import { CAT, CatURILabelMap, ClaimsLabelMap, HeaderLabelMap, AlgoLabelMap, CatRLabelMap } from './cat.js';


// Static HS256 Key for signing tokens (fallback key)
let hs256KeyHex = '403697de87af64611c1d32a05dab0fe1fcb715a86ab435f1ec99192d79569388';

// ES256 Private Key for signing
const es256PrivJwk = {
  key_ops: ['sign'],
  ext: false,
  kty: 'EC',
  x: 'D5fNFnQYFBOjWa1ndpQK3ZrzXuHD77oGDgPaMNbtZ7s',
  y: 'Y4iS6G8atqp3x85xJOfCY997AVWHPy-dEgLk6CaNZ7w',
  crv: 'P-256',
  d: 'CyJoz5l2IG9cPEXvPATnU3BHrNS1Qx5-dZ4e_Z0H_3M'
};

// ES256 Public Key PEM for validation
const es256PubPem = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAED5fNFnQYFBOjWa1ndpQK3ZrzXuHD
77oGDgPaMNbtZ7tjiJLobxq2qnfHznEk58Jj33sBVYc/L50SAuToJo1nvA==
-----END PUBLIC KEY-----`

// CAT configuration
const cat = new CAT({
  isCoseCborTagAdded: true,
  isCWTTagAdded: true,
  clockTolerance: 0
});

// Validator configuration
const cwtValidator = new CWTValidator({
  isCWTTagAdded: true,
  isCoseCborTagAdded: true,
  headerValidation: false,
  ignoreExpiration: false,
  ignoreNotBefore: false
});

// Generate a new HS256 Key
const generateKey = () => crypto.randomBytes(32).toString('hex');

// Function to generate a CAT token
// Generate a basic CAT token based on incoming JSON claims
async function generateToken(body) {
    // Process the 'catu' claim
    let catu = body['catu'];
    if (catu) {
      const catuMap = CWTUtil.claimsTranslate(catu, CatURILabelMap);
      for (const [key, value] of catuMap) {
        const [a, v] = value;
        if (a === MatchTypeLabelMap.sha256 || a === MatchTypeLabelMap.sha512) {
          const decodedValue = base16.decode(v);
          catuMap.set(key, [a, decodedValue]);
        }
      }
      body['catu'] = catuMap;
    }
  
    // Process the 'catalpn' claim (Array or String)
    let catalpn = body['catalpn'];
    if (catalpn) {
      body['catalpn'] = Array.isArray(catalpn) 
        ? catalpn.map(c => new TextEncoder().encode(c)) 
        : new TextEncoder().encode(catalpn);
    }
  
    // Process the 'catr' claim (Renewal Fields)
    let catr = body['catr'];
    if (catr) {
      const catrenewal = new Map();
      catrenewal.set(CatRLabelMap.renewal_type, catr['renewabletype']);
      catrenewal.set(CatRLabelMap.exp_extension, catr['expext']);
      if (catr['deadline']) {
        catrenewal.set(CatRLabelMap.renewal_deadline, catr['deadline']);
      }
      body['catr'] = catrenewal;
    }
  
    // Create the payload, including timestamps
    const now = Math.floor(Date.now() / 1000);
    const payload = CWTUtil.claimsTranslate(body, ClaimsLabelMap);
    payload.set(ClaimsLabelMap.iat, now);
    payload.set(ClaimsLabelMap.nbf, now);
  
    // Verify the payload is well-formed
    const isWellFormedPayload = cat.isCATWellFormed(payload);
    if (isWellFormedPayload.status) {
      // Define protected and unprotected headers
      const protectedHeader = new Map();
      protectedHeader.set(HeaderLabelMap.alg, AlgoLabelMap.HS256);
  
      const unprotectedHeaders = new Map();
      unprotectedHeaders.set(HeaderLabelMap.kid, new TextEncoder().encode("akamai_key_hs256"));
  
      // Import the signing key
      const sKey = await crypto.subtle.importKey(
        'raw',
        Buffer.from(hs256KeyHex, 'hex'),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      );
  
      // Sign the payload and generate the CAT token
      const signer = { key: sKey };
      const cwtTokenBuf = await CWTGenerator.mac(
        payload, 
        signer, 
        { p: protectedHeader, u: unprotectedHeaders }, 
        {}, 
        { isCoseCborTagAdded: true, isCWTTagAdded: true }
      );
  
      // Encode the signed token as base64url
      const cwtTokenBase64 = base64url.encode(new Uint8Array(cwtTokenBuf));
      return cwtTokenBase64;
    } else {
      throw new Error(isWellFormedPayload.errMsg);
    }
  }  


function findKeyByValue(key) {
    return Object.keys(ClaimsLabelMap).find(k => ClaimsLabelMap[k] === key) || key.toString();
}

function findNestedKey(key, nestedKey) {
    if (key === ClaimsLabelMap.catr) {
        return Object.keys(CatRLabelMap).find(k => CatRLabelMap[k] === nestedKey) || nestedKey.toString();
    }
    if (key === ClaimsLabelMap.catu) {
        return Object.keys(CatURILabelMap).find(k => CatURILabelMap[k] === nestedKey) || nestedKey.toString();
    }
    if (key === ClaimsLabelMap.catm) {
        return Object.keys(MatchTypeLabelMap).find(k => MatchTypeLabelMap[k] === nestedKey) || nestedKey.toString();
    }
    return nestedKey.toString();  // Default fallback
}

// Function to validate a CAT token
async function validateToken(token) {
    try {
        // Decode the base64url token into Uint8Array
        const tokenBuf = new Uint8Array(base64url.toBuffer(token.trim()));

        // Decode the token with CAT decoder
        const decodedToken = cat.decode(tokenBuf);

        const kid = new TextDecoder().decode(decodedToken.header.u.get(HeaderLabelMap.kid));

        let verificationKey;
        if (kid === 'akamai_key_hs256') {
            verificationKey = await crypto.subtle.importKey(
                'raw',
                Buffer.from(hs256KeyHex, 'hex'),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['verify']
            );
        } else if (kid === 'akamai_key_es256') {
            verificationKey = await crypto.subtle.importKey(
                'spki',
                Buffer.from(es256PubPem, 'utf-8'),
                { name: "ECDSA", namedCurve: "P-256" },
                false,
                ['verify']
            );
        } else {
            throw new Error(`Unknown 'kid': ${kid}`);
        }

        // Verify token signature
        await cwtValidator.validate(tokenBuf, [{ key: verificationKey }]);

        // Check if CAT claim set is acceptable
        const result = await cat.isCATAcceptable(decodedToken.payload, {});
        if (result.status === true) {
            const payload = {};

            for (const [key, value] of decodedToken.payload.entries()) {
                let claimKey = findKeyByValue(key); // Custom function to find the correct key string

                // Handle nested Maps like catr and other maps
                if (value instanceof Map) {
                    const nestedPayload = {};
                    for (const [nestedKey, nestedValue] of value.entries()) {
                        let nestedClaimKey = findNestedKey(key, nestedKey); // Adjust for each nested map type
                        nestedPayload[nestedClaimKey] = nestedValue;
                    }
                    payload[claimKey] = nestedPayload;
                } else {
                    payload[claimKey] = value;
                }
            }

            return { status: true, payload: payload };  // Return the translated payload
        } else {
            throw new Error(result.errMsg);
        }
    } catch (err) {
        return { status: false, error: err.message };
    }
}

// Server logic for handling token generation, validation, and key management
const server = http.createServer(async (req, res) => {
  if (req.url === '/generateToken' && req.method === 'POST') {
    try {
      let body = '';
      for await (let chunk of req) {
        body += chunk.toString();
      }
      const token = await generateToken(JSON.parse(body));
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(token);
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end(err.message);
    }
  } else if (req.url === '/generateKey' && req.method === 'GET') {
    hs256KeyHex = generateKey();  // Dynamically update the HS256 key
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(hs256KeyHex);
  } else if (req.url === '/validateToken' && req.method === 'POST') {
    try {
      let body = '';
      for await (let chunk of req) {
        body += chunk.toString();
      }
      const { token } = JSON.parse(body);
      const validationResult = await validateToken(token);
      if (validationResult.status) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "Token is valid", payload: validationResult.payload }));
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(validationResult.error);
      }
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end(err.message);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
