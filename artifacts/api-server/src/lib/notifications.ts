interface DispatchEmailParams {
  technicianName: string;
  technicianEmail: string | null;
  requestTitle: string;
  requestId: string;
  customerName: string;
  location: string;
  priority: string;
  category: string;
  etaDate: Date;
  distanceKm: number;
}

export async function sendDispatchEmail(params: DispatchEmailParams): Promise<{ sent: boolean; error?: string }> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY || !params.technicianEmail) {
    return { sent: false, error: "RESEND_API_KEY not configured or no technician email" };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);
    const etaStr = params.etaDate.toLocaleString();
    await resend.emails.send({
      from: "FieldForce360 <dispatch@fieldforce360.app>",
      to: params.technicianEmail,
      subject: `[${params.priority}] New Assignment: ${params.requestTitle}`,
      html: `
        <h2>You've been assigned a new job</h2>
        <p><strong>Request:</strong> ${params.requestId} — ${params.requestTitle}</p>
        <p><strong>Customer:</strong> ${params.customerName}</p>
        <p><strong>Location:</strong> ${params.location}</p>
        <p><strong>Category:</strong> ${params.category}</p>
        <p><strong>Priority:</strong> ${params.priority}</p>
        <p><strong>Distance:</strong> ${params.distanceKm} km</p>
        <p><strong>ETA:</strong> ${etaStr}</p>
      `,
    });
    return { sent: true };
  } catch (err: unknown) {
    return { sent: false, error: err instanceof Error ? err.message : String(err) };
  }
}
