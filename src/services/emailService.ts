/**
 * Mailjet Email Service
 * Handles sending email notifications via Mailjet API
 * PRD Reference: Section 13 - Email/Notification Events
 */
import Mailjet from "node-mailjet";

/**
 * Initialize Mailjet client
 * Uses environment variables: MAILJET_API_KEY and MAILJET_API_SECRET
 * @throws Error if credentials are not configured
 */
function getMailjetClient() {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Mailjet credentials not configured. Please set MAILJET_API_KEY and MAILJET_API_SECRET in your .env file."
    );
  }

  return new Mailjet({
    apiKey,
    apiSecret,
  });
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: {
    email: string;
    name?: string;
  };
}

/**
 * Send email via Mailjet
 * @param options - Email options (to, subject, html/text, from)
 * @returns Promise resolving to Mailjet response
 * @throws Error if Mailjet is not configured (in development, this is logged but doesn't fail)
 */
export async function sendEmail(options: EmailOptions): Promise<any> {
  // Check if Mailjet is configured - if not, log and return (don't fail)
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.warn(
      "Mailjet not configured. Email not sent. Set MAILJET_API_KEY and MAILJET_API_SECRET in .env to enable emails."
    );
    // Return a mock success response so the request doesn't fail
    return { success: true, message: "Email skipped (Mailjet not configured)" };
  }

  try {
    const mailjet = getMailjetClient();
    const fromEmail = options.from?.email || process.env.MAILJET_FROM_EMAIL || "noreply@strikeforce.com";
    const fromName = options.from?.name || process.env.MAILJET_FROM_NAME || "StrikeForce Platform";

    // Convert single recipient to array
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const toEmails = recipients.map((email) => ({ Email: email }));

    const result = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: fromName,
          },
          To: toEmails,
          Subject: options.subject,
          TextPart: options.text || options.html?.replace(/<[^>]*>/g, "") || "",
          HTMLPart: options.html || options.text || "",
        },
      ],
    });

    return result;
  } catch (error) {
    console.error("Failed to send email via Mailjet:", error);
    throw error;
  }
}

/**
 * Send invitation email to student or supervisor
 * PRD Reference: Section 4 - Students receive invitation links
 */
export async function sendInvitationEmail(
  email: string,
  invitationToken: string,
  role: "student" | "supervisor",
  organizationName: string
): Promise<void> {
  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/invite?token=${invitationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You've been invited to join StrikeForce</h2>
      <p>Hello,</p>
      <p>You've been invited by <strong>${organizationName}</strong> to join StrikeForce as a <strong>${role}</strong>.</p>
      <p>Click the link below to accept the invitation and set up your account:</p>
      <p style="margin: 30px 0;">
        <a href="${invitationUrl}" style="background-color: #e9226e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Accept Invitation
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${invitationUrl}</p>
      <p style="margin-top: 30px; color: #666; font-size: 12px;">
        This invitation link will expire in 7 days.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Invitation to join StrikeForce as ${role}`,
    html,
  });
}

/**
 * Send KYC approval notification email
 * PRD Reference: Section 4 - Super Admin approval notifications
 */
export async function sendKYCApprovalEmail(
  email: string,
  organizationName: string,
  approved: boolean
): Promise<void> {
  const subject = approved
    ? `Your organization ${organizationName} has been approved`
    : `KYC review update for ${organizationName}`;

  const html = approved
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎉 Your organization has been approved!</h2>
        <p>Hello,</p>
        <p>Great news! <strong>${organizationName}</strong> has been approved by our Super Admin team.</p>
        <p>You can now access your dashboard and start using StrikeForce.</p>
        <p style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login" style="background-color: #e9226e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Log In to Dashboard
          </a>
        </p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>KYC Review Update</h2>
        <p>Hello,</p>
        <p>Unfortunately, the KYC documents for <strong>${organizationName}</strong> have been rejected.</p>
        <p>Please review the feedback and upload new documents through your account.</p>
        <p style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login" style="background-color: #e9226e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Log In to Upload Documents
          </a>
        </p>
      </div>
    `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Send supervisor request notification email
 * PRD Reference: Section 5 - Supervisor request notifications
 */
export async function sendSupervisorRequestEmail(
  supervisorEmail: string,
  studentName: string,
  projectTitle: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Supervisor Request</h2>
      <p>Hello,</p>
      <p><strong>${studentName}</strong> has requested you as a supervisor for the project: <strong>${projectTitle}</strong>.</p>
      <p>Please log in to your dashboard to review and respond to this request.</p>
      <p style="margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/supervisor/requests" style="background-color: #e9226e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Request
        </a>
      </p>
    </div>
  `;

  await sendEmail({
    to: supervisorEmail,
    subject: `New supervisor request for ${projectTitle}`,
    html,
  });
}

/**
 * Send milestone notification email
 * PRD Reference: Section 9 - Milestone notifications
 */
export async function sendMilestoneNotificationEmail(
  email: string,
  milestoneTitle: string,
  status: "proposed" | "accepted" | "finalized" | "funded" | "submitted" | "approved" | "released",
  projectTitle: string
): Promise<void> {
  const statusMessages: Record<string, string> = {
    proposed: "A new milestone has been proposed",
    accepted: "Milestone has been accepted",
    finalized: "Milestone has been finalized",
    funded: "Milestone escrow has been funded",
    submitted: "Milestone work has been submitted",
    approved: "Milestone has been approved",
    released: "Milestone payment has been released",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${statusMessages[status] || "Milestone Update"}</h2>
      <p>Hello,</p>
      <p>The milestone <strong>${milestoneTitle}</strong> for project <strong>${projectTitle}</strong> has been updated.</p>
      <p>Status: <strong>${status}</strong></p>
      <p style="margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/partner/projects" style="background-color: #e9226e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Project
        </a>
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Milestone Update: ${milestoneTitle}`,
    html,
  });
}

/**
 * Send organization invitation email with credentials
 * PRD Reference: Section 4 - Organizations receive invitation with credentials
 * @param email - Organization admin email
 * @param organizationName - Name of the organization
 * @param password - Generated password for the account
 * @param role - User role (partner or university-admin)
 */
export async function sendOrganizationInvitationEmail(
  email: string,
  organizationName: string,
  password: string,
  role: "partner" | "university-admin"
): Promise<void> {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`;
  const roleName = role === "partner" ? "Partner" : "University Admin";
  const dashboardUrl = role === "partner" 
    ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/partner`
    : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/university-admin`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to StrikeForce!</h2>
      <p>Hello,</p>
      <p>Your organization <strong>${organizationName}</strong> has been created and approved on StrikeForce.</p>
      <p>You have been set up as the <strong>${roleName}</strong> administrator for your organization.</p>
      
      <div style="background-color: #f9f9f9; border: 2px solid #e9226e; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <h3 style="margin-top: 0; color: #e9226e;">Your Login Credentials</h3>
        <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 10px 0;"><strong>Password:</strong> <code style="background-color: white; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 14px;">${password}</code></p>
        <p style="margin-top: 15px; font-size: 12px; color: #666;">
          <strong>⚠️ Important:</strong> Please save these credentials securely. For security reasons, we recommend changing your password after your first login.
        </p>
      </div>

      <p style="margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #e9226e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Log In to Dashboard
        </a>
      </p>
      
      <p>Or visit: <a href="${dashboardUrl}">${dashboardUrl}</a></p>
      
      <p style="margin-top: 30px; color: #666; font-size: 12px;">
        If you have any questions, please don't hesitate to contact our support team.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Your ${organizationName} account has been created on StrikeForce`,
    html,
  });
}

