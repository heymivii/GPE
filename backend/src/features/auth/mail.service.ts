import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);
  private transporterReady: Promise<void>;

  constructor() {
    this.transporterReady = this.initializeTransporter();
  }

  private async initializeTransporter() {
    if (process.env.NODE_ENV !== 'production') {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log('📧 Using Ethereal Email for development');
      this.logger.log(`📬 View emails at: https://ethereal.email/login`);
      this.logger.log(`   User: ${testAccount.user}`);
      this.logger.log(`   Pass: ${testAccount.pass}`);
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    await this.transporterReady;

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"SkyWalk" <${process.env.SMTP_FROM || 'noreply@skywalk.com'}>`,
      to,
      subject: 'Réinitialisation de votre mot de passe - SkyWalk',
      html: this.getPasswordResetTemplate(resetLink),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Password reset email sent to ${to}`);

      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(
          `📧 Preview email: ${nodemailer.getTestMessageUrl(info)}`,
        );
      }

      return true;
    } catch (error) {
      this.logger.error(
        `❌ Failed to send password reset email to ${to}`,
        error,
      );
      return false;
    }
  }

  async sendWelcomeEmail(to: string, fullName: string) {
    await this.transporterReady;

    const mailOptions = {
      from: `"SkyWalk" <${process.env.SMTP_FROM || 'noreply@skywalk.com'}>`,
      to,
      subject: 'Bienvenue sur SkyWalk ! 🌍',
      html: this.getWelcomeTemplate(fullName),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Welcome email sent to ${to}`);

      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(
          `📧 Preview email: ${nodemailer.getTestMessageUrl(info)}`,
        );
      }

      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email to ${to}`, error);
      return false;
    }
  }

  private getPasswordResetTemplate(resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #5EA3C0 0%, #4A8BA0 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .content p {
            color: #333333;
            line-height: 1.6;
            margin: 0 0 20px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #5EA3C0;
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.3s ease;
          }
          .button:hover {
            background-color: #4A8BA0;
          }
          .warning {
            background-color: #FFF3CD;
            border-left: 4px solid #FFC107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning p {
            margin: 0;
            color: #856404;
            font-size: 14px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe SkyWalk. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </div>

            <div class="warning">
              <p>⏱️ <strong>Ce lien est valide pendant 1 heure.</strong></p>
              <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
            </div>

            <p style="margin-top: 30px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #5EA3C0; font-size: 12px;">${resetLink}</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par SkyWalk</p>
            <p>Votre compagnon pour l'expatriation 🌍</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeTemplate(fullName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur SkyWalk</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #5EA3C0 0%, #4A8BA0 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .content p {
            color: #333333;
            line-height: 1.6;
            margin: 0 0 20px 0;
          }
          .features {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .feature {
            margin: 15px 0;
            display: flex;
            align-items: center;
          }
          .feature-icon {
            font-size: 24px;
            margin-right: 15px;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #5EA3C0;
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue ${fullName} !</h1>
          </div>
          <div class="content">
            <p>Nous sommes ravis de vous accueillir sur <strong>SkyWalk</strong> !</p>
            <p>Votre compte a été créé avec succès. Vous pouvez maintenant profiter de toutes nos fonctionnalités pour préparer votre projet d'expatriation.</p>
            
            <div class="features">
              <div class="feature">
                <span class="feature-icon">🗺️</span>
                <span>Comparez les villes du monde entier</span>
              </div>
              <div class="feature">
                <span class="feature-icon">💰</span>
                <span>Analysez le coût de la vie</span>
              </div>
              <div class="feature">
                <span class="feature-icon">📋</span>
                <span>Suivez vos démarches administratives</span>
              </div>
              <div class="feature">
                <span class="feature-icon">💼</span>
                <span>Découvrez des opportunités professionnelles</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Accéder à mon tableau de bord</a>
            </div>
          </div>
          <div class="footer">
            <p>À bientôt sur SkyWalk ! 🌍</p>
            <p>L'équipe SkyWalk</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
