const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) return null;
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
}

const SERVICE_LABELS = {
  battery: 'Jump Start',
  tire: 'Flat Tire',
  fuel: 'Fuel Delivery',
  other: 'Other Service',
};

async function sendConfirmationEmail(request) {
  const t = getTransporter();
  if (!t) {
    console.warn('Email not configured — skipping confirmation email');
    return null;
  }
  if (!request.customerEmail) return null;

  const serviceLabel = SERVICE_LABELS[request.serviceType] ?? request.serviceType;
  const amount = `$${(request.amountCents / 100).toFixed(2)}`;
  const trackUrl = `http://localhost:5173/track/${request.id}`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a202c">
      <div style="background:#1a56db;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">RoadReady</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px">Roadside Assistance</p>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none">
        <h2 style="margin:0 0 8px;font-size:20px">Your request is confirmed!</h2>
        <p style="color:#718096;margin:0 0 24px">Request #${request.id} has been received and payment processed.</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr style="border-bottom:1px solid #e2e8f0">
            <td style="padding:10px 0;color:#718096;font-size:14px;width:140px">Service</td>
            <td style="padding:10px 0;font-size:14px;font-weight:600">${serviceLabel}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0">
            <td style="padding:10px 0;color:#718096;font-size:14px">Vehicle</td>
            <td style="padding:10px 0;font-size:14px">${request.vehicleYear} ${request.vehicleMake} ${request.vehicleModel}${request.vehicleColor ? ` (${request.vehicleColor})` : ''}</td>
          </tr>
          ${request.locationAddress ? `
          <tr style="border-bottom:1px solid #e2e8f0">
            <td style="padding:10px 0;color:#718096;font-size:14px">Location</td>
            <td style="padding:10px 0;font-size:14px">${request.locationAddress}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:10px 0;color:#718096;font-size:14px">Amount paid</td>
            <td style="padding:10px 0;font-size:14px;font-weight:700;color:#1a56db">${amount}</td>
          </tr>
        </table>

        <a href="${trackUrl}" style="display:inline-block;background:#1a56db;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">
          Track My Request →
        </a>

        <p style="color:#a0aec0;font-size:12px;margin:24px 0 0">
          A technician will be assigned shortly. You'll receive SMS updates as your service progresses.
        </p>
      </div>
    </div>
  `;

  return t.sendMail({
    from: `"RoadReady" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: request.customerEmail,
    subject: `RoadReady — Request #${request.id} Confirmed (${serviceLabel})`,
    html,
    text: `Your RoadReady request #${request.id} is confirmed.\n\nService: ${serviceLabel}\nVehicle: ${request.vehicleYear} ${request.vehicleMake} ${request.vehicleModel}\nAmount: ${amount}\n\nTrack your request: ${trackUrl}`,
  });
}

module.exports = { sendConfirmationEmail };
