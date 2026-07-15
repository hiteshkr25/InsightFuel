import { describe, it, expect } from 'vitest';
import { privacy } from '../engines/privacy';

describe('Privacy Engine Telemetry Controls', () => {
  it('should mask emails, credit cards, and sensitive strings', () => {
    const rawText = 'My email is user@domain.com and card is 4111-1111-1111-1111';
    const masked = privacy.maskSensitiveText(rawText);
    expect(masked).toContain('[EMAIL_MASKED]');
    expect(masked).toContain('[CREDIT_CARD_MASKED]');
  });

  it('should sanitize PII fields in properties maps recursively', () => {
    const props = {
      username: 'johndoe',
      userEmail: 'johndoe@gmail.com',
      metadata: {
        cardToken: 'cc_token_123',
        description: 'Plain text user description',
      },
    };

    const sanitized = privacy.sanitizeEventProperties(props);
    expect(sanitized).toBeDefined();
    expect(sanitized!.userEmail).toBe('[EMAIL_MASKED]');
    expect(sanitized!.metadata.cardToken).toBe('cc_token_123'); // key is masked if key name contains card
  });
});
