import { randomBytes, generateKeyPairSync } from 'crypto';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';

// Generate a 256-bit key (32 bytes)
const hs256KeyHex = randomBytes(32).toString('hex');
console.log('HS256 Key:', hs256KeyHex);

// Generate an ES256 key pair
const { publicKey, privateKey } = await generateKeyPair('ES256');

// Export the private key as JWK
const jwk = await exportJWK(privateKey);
console.log('ES256 Private Key (JWK):', jwk);

// Create a JWT
const jwt = await new SignJWT({ 'user': 'TheCatHunter' })
  .setProtectedHeader({ alg: 'ES256' })
  .setIssuedAt()
  .setExpirationTime('2h')
  .sign(privateKey);

console.log('Signed JWT:', jwt);
