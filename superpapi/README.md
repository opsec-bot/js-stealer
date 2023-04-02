# node-dpapi
Node native module to encrypt/decrypt data. On Windows, it uses DPAPI

## API:
```typescript
function protectData(
    userData: Uint8Array,
    optionalEntropy: Uint8Array | null,
    scope: "CurrentUser" | "LocalMachine"
): Uint8Array;

function unprotectData(
    encryptedData: Uint8Array,
    optionalEntropy: Uint8Array | null,
    scope: "CurrentUser" | "LocalMachine"
): Uint8Array;
```

## Example:
```javascript
import * as dpapi from "node-dpapi";

const buffer = Buffer.from("Hello world", "utf-8");

const encrypted = dpapi.protectData(buffer, null, "CurrentUser");
const decrypted = dpapi.unprotectData(encrypted, null, "CurrentUser");
```

## FAQ:
Q: Does this work on all platforms?

A: Currently it just works on Windows, calling the protectData function from any other platform will result in an exception.
