import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({
  createTestAccount: jest.fn(),
  createTransport: jest.fn(),
  getTestMessageUrl: jest.fn(),
}));

describe('MailService', () => {
  let service: MailService;
  let sendMail: jest.Mock;

  beforeEach(async () => {
    sendMail = jest.fn();
    (nodemailer.createTestAccount as jest.Mock).mockResolvedValue({
      user: 'test-user',
      pass: 'test-pass',
    });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

    service = new MailService();
    await (service as any).transporterReady;
  });

  describe('sendPasswordResetEmail', () => {
    it('sends the email with the reset token in the link', async () => {
      sendMail.mockResolvedValue({});
      const result = await service.sendPasswordResetEmail(
        'a@b.com',
        'my-token',
      );

      expect(result).toBe(true);
      const mailOptions = sendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe('a@b.com');
      expect(mailOptions.html).toContain('my-token');
    });

    it('returns false when the transporter throws', async () => {
      sendMail.mockRejectedValue(new Error('smtp down'));
      const result = await service.sendPasswordResetEmail('a@b.com', 'tok');
      expect(result).toBe(false);
    });
  });

  describe('production transporter', () => {
    const originalEnv = process.env.NODE_ENV;
    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('configures the SMTP transporter from env vars in production, without ethereal', async () => {
      process.env.NODE_ENV = 'production';
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '2525';
      process.env.SMTP_SECURE = 'true';
      process.env.SMTP_USER = 'user';
      process.env.SMTP_PASS = 'pass';
      (nodemailer.createTransport as jest.Mock).mockClear();
      (nodemailer.createTestAccount as jest.Mock).mockClear();

      const prodService = new MailService();
      await (prodService as any).transporterReady;

      expect(nodemailer.createTestAccount).not.toHaveBeenCalled();
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.example.com',
          port: 2525,
          secure: true,
          auth: { user: 'user', pass: 'pass' },
        }),
      );

      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_SECURE;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
    });
  });

  describe('sendWelcomeEmail', () => {
    it('sends the email with the recipient name in the body', async () => {
      sendMail.mockResolvedValue({});
      const result = await service.sendWelcomeEmail('a@b.com', 'Jean Dupont');

      expect(result).toBe(true);
      const mailOptions = sendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe('a@b.com');
      expect(mailOptions.html).toContain('Jean Dupont');
    });

    it('returns false when the transporter throws', async () => {
      sendMail.mockRejectedValue(new Error('smtp down'));
      const result = await service.sendWelcomeEmail('a@b.com', 'Jean Dupont');
      expect(result).toBe(false);
    });
  });
});
