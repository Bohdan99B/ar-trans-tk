declare module "nodemailer" {
  type TransportOptions = {
    auth?: {
      pass?: string;
      user?: string;
    };
    host?: string;
    port?: number;
    secure?: boolean;
  };

  type MailOptions = {
    from?: string;
    subject: string;
    text: string;
    to: string;
  };

  export function createTransport(options: TransportOptions): {
    sendMail(options: MailOptions): Promise<unknown>;
  };
}
