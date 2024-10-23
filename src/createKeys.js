import { randomBytes, generateKeyPairSync } from 'crypto';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';

// Generate a 256-bit key (32 bytes)
const hs256KeyHex = randomBytes(32).toString('hex');
console.log('HS256 Key:', hs256KeyHex);

// Generate an ES256 key pair (P-256 curve)
const { publicKey, privateKey } = generateKeyPairSync('ec', {
    namedCurve: 'P-256',   // Curve name
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' }
  });
  
  console.log('ES256 Private Key (PEM):', privateKey);
  console.log('ES256 Public Key (PEM):', publicKey);


