import { Resend } from "resend";

const resendApiKey = process.env["RESEND_API_KEY"];
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = "FieldForce 360 <dispatch@fieldforce360.app>";

export interface DispatchNotificationPayload {
  technicianName: string;
  technicianEmail?: string | null;
  requestTitle: string;
  requestId: string;
  customerName: string;
  location: string;
  priority: string;
  category: string;
  etaDate: Date;
  distanceKm: number;
}

function formatEta(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function priorityColor(p: string): string {
  const map: Record<string, string> = { Critical: "#f43f5e", High: "#f59e0b", Medium: "#06b6d4", Low: "#64748b" };
  return map[p] ?? "#06b6d4";
}

function buildEmailHtml(p: DispatchNotificationPayload): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1623;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1623;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#141c2e;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#06b6d4,#6366f1);padding:28px 32px">
            <p style="margin:0;color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:2px;text-transform:uppercase">FieldForce 360</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700">⚡ New Job Assigned</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px 32px">
            <p style="margin:0 0 20px;color:#94a3b8;font-size:14px">Hi <strong style="color:#e2e8f0">${p.technicianName}</strong>, you have been dispatched to a new service request.</p>
            <!-- Job card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1623;border-radius:12px;border:1px solid rgba(255,255,255,0.06);margin-bottom:20px">
              <tr>
                <td style="padding:20px 24px">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
                    <span style="background:${priorityColor(p.priority)}22;color:${priorityColor(p.priority)};font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;border:1px solid ${priorityColor(p.priority)}44;display:inline-block">${p.priority}</span>
                    <span style="color:#475569;font-size:11px;margin-left:6px">${p.requestId}</span>
                  </div>
                  <h2 style="margin:10px 0 6px;color:#f1f5f9;font-size:18px;font-weight:700">${p.requestTitle}</h2>
                  <p style="margin:0;color:#64748b;font-size:13px">${p.category}</p>
                </td>
              </tr>
            </table>
            <!-- Details grid -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
              <tr>
                <td width="50%" style="padding:0 8px 12px 0;vertical-align:top">
                  <p style="margin:0 0 4px;color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px">Customer</p>
                  <p style="margin:0;color:#e2e8f0;font-size:14px;font-weight:600">${p.customerName}</p>
                </td>
                <td width="50%" style="padding:0 0 12px 8px;vertical-align:top">
                  <p style="margin:0 0 4px;color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px">Location</p>
                  <p style="margin:0;color:#e2e8f0;font-size:14px;font-weight:600">${p.location}</p>
                </td>
              </tr>
              <tr>
                <td width="50%" style="padding:0 8px 0 0;vertical-align:top">
                  <p style="margin:0 0 4px;color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px">ETA</p>
                  <p style="margin:0;color:#06b6d4;font-size:14px;font-weight:600">${formatEta(p.etaDate)}</p>
                </td>
                <td width="50%" style="padding:0 0 0 8px;vertical-align:top">
                  <p style="margin:0 0 4px;color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px">Distance</p>
                  <p style="margin:0;color:#e2e8f0;font-size:14px;font-weight:600">${p.distanceKm} km away</p>
                </td>
              </tr>
            </table>
            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${process.env["REPLIT_DEV_DOMAIN"] ? `https://${process.env["REPLIT_DEV_DOMAIN"]}/technician` : "https://fieldforce360.replit.app/technician"}"
                    style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#6366f1);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 32px;border-radius:10px">
                    Open My Dashboard →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="margin:0;color:#334155;font-size:12px;text-align:center">FieldForce 360 · Smart Field Service Dispatch · This is an automated notification</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendDispatchEmail(payload: DispatchNotificationPayload): Promise<{ sent: boolean; error?: string }> {
  if (!resend) {
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }
  if (!payload.technicianEmail) {
    return { sent: false, error: "No email address for technician" };
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.technicianEmail,
      subject: `⚡ [${payload.priority}] New job: ${payload.requestTitle} — ${payload.requestId}`,
      html: buildEmailHtml(payload),
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (e: unknown) {
    return { sent: false, error: e instanceof Error ? e.message : "Unknown send error" };
  }
}

export function notificationsReady(): boolean {
  return !!resendApiKey;
}
