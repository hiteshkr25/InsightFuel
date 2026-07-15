import hmac
import hashlib

def verify_request_signature(payload: str, secret: str, signature: str) -> bool:
  """
  Verifies that the HMAC-SHA256 signature of the payload using the given secret
  matches the signature header.
  """
  if not secret or not signature:
    return False

  try:
    key_bytes = secret.encode('utf-8')
    msg_bytes = payload.encode('utf-8')
    expected = hmac.new(key_bytes, msg_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
  except Exception:
    return False
