export async function verifyDiscordRequest(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const subtle = globalThis.crypto.subtle;

  try {
    // Ed25519公開鍵をインポート
    const key = await subtle.importKey(
      'raw',
      hexToArrayBuffer(publicKey),
      {
        name: 'ed25519',
        namedCurve: 'ed25519',
      },
      false,
      ['verify']
    );

    // 署名検証用のメッセージを作成
    const message = encoder.encode(timestamp + body);

    // 署名を検証
    const isValid = await subtle.verify(
      {
        name: 'ed25519',
      },
      key,
      hexToArrayBuffer(signature),
      message
    );

    return isValid;
  } catch (error) {
    // Signature verification failed
    return false;
  }
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  // 正規表現を使って2文字ずつのグループに分割
  const matches = hex.match(/.{1,2}/g);
  if (matches == null) {
    throw new Error('Value is not a valid hex string');
  }
  const hexVal = matches.map((byte: string) => Number.parseInt(byte, 16));
  return new Uint8Array(hexVal).buffer;
}