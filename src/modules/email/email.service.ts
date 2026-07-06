import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface InviteEmailData {
	to: string;
	clientName: string;
	freelancerName: string;
	projectTitle: string;
	inviteUrl: string;
}

export async function sendInviteEmail(data: InviteEmailData) {
	if (!process.env.RESEND_API_KEY) {
		console.warn("RESEND_API_KEY not set, skipping email");
		return null;
	}

	return await resend.emails.send({
		from: process.env.FROM_EMAIL ?? "EntroSync <noreply@entrosync.com>",
		to: data.to,
		subject: `${data.freelancerName} invited you to view "${data.projectTitle}"`,
		html: buildInviteHtml(data),
	});
}

function buildInviteHtml(data: InviteEmailData): string {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Invitation</title>
    </head>
    <body style="margin:0;padding:0;background-color:#09090b;font-family:system-ui,-apple-system,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="100%" max-width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#18181b;border-radius:16px;border:1px solid #27272a;">
              <tr>
                <td style="padding:40px 32px 32px;">
                  <h1 style="color:#fafafa;font-size:20px;font-weight:600;margin:0 0 8px;">You're invited!</h1>
                  <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 24px;">
                    <strong style="color:#e4e4e7;">${escapeHtml(data.freelancerName)}</strong> invited you to view the project
                    <strong style="color:#e4e4e7;">"${escapeHtml(data.projectTitle)}"</strong> on EntroSync.
                  </p>
                  <a href="${data.inviteUrl}" style="display:inline-block;background:#ffffff;color:#09090b;text-decoration:none;padding:14px 28px;border-radius:9999px;font-size:14px;font-weight:600;">View Project Dashboard</a>
                  <p style="color:#52525b;font-size:12px;margin:24px 0 0;">
                    Or copy this link:<br>
                    <span style="color:#a1a1aa;word-break:break-all;">${data.inviteUrl}</span>
                  </p>
                  <p style="color:#52525b;font-size:12px;margin:16px 0 0;">
                    This link expires in 30 days. No account or password required.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
