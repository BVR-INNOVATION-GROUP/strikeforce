## Product Requirements Document (PRD) — StrikeForce Platform

### 1. Overview
- Purpose: Connect universities, students, and partner organizations to execute real-world, milestone-based projects with portfolio/reputation tracking and escrow-backed payments.
- Core tenets:
  - Portfolio-first performance (no academic grading).
  - Project-based milestones negotiated via chat; partner finalizes and funds.
  - Students select supervisors; supervisors approve/deny requests.
  - KYC and Super Admin approvals required for organizations.
  - Wallet/escrow for funding and payouts.
  - University admin can onboard via manual or bulk uploads; students receive invitation links.

### 2. Goals and Non-Goals
- Goals:
  - Streamlined onboarding (bulk/manual + invitations).
  - Transparent applications (individual or group), screening, and assignment.
  - Chat-led milestone negotiation; partner finalization.
  - Supervisor approval gate before partner releases escrow.
  - Portfolio and reputation tracking; financial compliance.
- Non-Goals:
  - No academic gradebook.
  - No real-time proctoring or complex LMS assessments.

### 3. Actors and Roles
- Super Admin: Approves universities/partners (KYC), resolves escalated disputes, audits.
- University Admin: Onboards supervisors/students (manual/bulk), sets policies, oversees disputes.
- Supervisor: Receives student supervisor requests, approves/denies, reviews submissions, marks “Ready for Partner”.
- Partner (Org): Submits projects, negotiates/finalizes milestones, funds escrow, approves/rejects work, releases payouts.
- Student (Individual/Group Leader/Member): Creates/join groups, applies to projects, proposes milestones, delivers work, receives payouts.

### 4. Onboarding
- Organizations (Partner/University):
  - Sign up → upload KYC/legal docs → Super Admin approval → access granted.
  - University Admin can add supervisors/students via:
    - Manual create (single form).
    - Bulk CSV uploads (Departments, Courses, Supervisors, Students).
- Students:
  - Added by University (manual/bulk) → system emails invitation link → student sets password and completes profile.
- Partners:
  - Sign up → submit KYC → Super Admin approval → complete billing profile and wallet funding methods.

### 5. Supervisor Selection (Student-led)
- Students choose a preferred supervisor per project/course.
- Flow: Student/Group → “Request Supervisor” → Supervisor sees inbox of requests → Approve/Deny.
- Constraints:
  - Supervisor capacity caps (configurable).
  - Optional prerequisites (department/course match).
- Notifications:
  - Approved: project workspace shows supervisor; students/partner notified.
  - Denied: students prompted to select another supervisor.

### 6. Groups and Applications
- Groups:
  - Student creates group (leader), sets name/capacity, invites classmates; can accept join requests; can transfer leadership.
- Applications:
  - Apply as Group or Individual to a project.
  - Eligibility gate (course/skills/deadlines).
  - Portfolio-first screening (verified work, ratings, on-time rate, rework rate, role history, endorsements).
  - Buckets: Rejected, Consider, Shortlist, Waitlist.
  - Offers issued by University Admin/Supervisor; Partner can recommend but not finalize selection.
  - Acceptance locks team and capacity.

### 7. Project Chat and Milestone Negotiation
- Project chat includes Partner, Group, and Supervisor (commenting).
- Proposal messages:
  - Title, scope, acceptance criteria, due date, amount (if funded).
  - Proposal states: Draft → Proposed → Accepted (students) → Finalized (partner) → Scheduled.
- Partner finalizes; system creates Milestone; escrow funding required to start.

### 8. Wallet, Escrow, Payouts
- Partner Wallet:
  - Funding methods: bank transfer, card, mobile money; ledger with deposits, holds, releases, fees.
- Escrow:
  - Per milestone. Must be funded to move “In Progress”.
- Payouts:
  - On partner approval (after supervisor gate): escrow releases to student splits or university account (policy).
  - Invoices/receipts generated; full audit trail.

### 9. Milestone Lifecycle (Supervisor Involved)
- States: Draft → Proposed → Accepted → Finalized → Funded → In Progress → Submitted → Supervisor Review → Partner Review → Approved/Changes → Released → Completed.
- Supervisor Review (mandatory gate):
  - Actions: Approve for Partner, Request Changes, Add notes/risks, Adjust progress.
- Partner Review:
  - Approve & Release escrow, Request Changes.

### 10. Screening and Shortlisting (Details)
- Auto scoring on:
  - Skill-match vs project requirements, prior verified projects, partner ratings, on-time rate, rework rate, endorsements, availability fit.
- Manual scoring:
  - Supervisor and Partner (advisory).
- Group scoring:
  - Composite = average member score + skill coverage bonus.
- Offers:
  - Expiry timers; auto-promote from Waitlist on expiry/decline.

### 11. Performance and Reputation (No Grades)
- Portfolio items created per completed milestone/project:
  - Role, scope, proof links/files, partner rating, complexity, amount delivered.
- Reputation score:
  - Weighted across completed projects, average partner rating, on-time delivery, dispute rate, rework, complexity.
- Screening uses portfolio signals and reputation (no gradebook).

### 12. Compliance, Disputes, and Audit
- KYC required before funding or payouts.
- Dispute windows:
  - Milestone approval window; escalation ladder:
    - Student/Partner → Supervisor → University Admin → Super Admin.
- Audit logs:
  - Milestone events, approvals, financial transactions, KYC decisions, supervisor decisions.

### 13. Email/Notification Events
- Invitations (students/supervisors).
- Supervisor request received/approved/denied.
- Offer sent/accepted/declined.
- Milestone: proposed/accepted/finalized/funded/submitted/reviewed/approved/released.
- Wallet: deposit, low balance, escrow hold/release.
- Dispute opened/updated/resolved.

### 14. Key Screens (MVP scope)
- Partner:
  - Submit Project, Project Details (Milestones: Proposals/Finalized), Messages (chat), Wallet & Funding, Contracts/Invoices, Reports.
- Student:
  - Dashboard, Find Projects, Group Management, Project Workspace (Milestones, Messages, Submissions, Escrow Status), Portfolio, Earnings/Payouts, Supervisor Request.
- Supervisor:
  - Requests Inbox, Project Dashboard (Review Queue), Milestone Review (Approve/Request Changes), Comments/Notes.
- University Admin:
  - Org KYC (view status), Manual/Bulk Uploads, Departments/Courses, Screening & Shortlisting panel, Offers & Assignments, Dispute Center, Policy Settings (caps, payout routing).
- Super Admin:
  - KYC Approvals (partners/universities), Global Audit, Final Dispute Arbitration.

### 15. Functional Requirements (selected)
- Invitations:
  - Generate signed, time-bound invite links for students/supervisors; one-time use; supports password set.
- Supervisor Requests:
  - Create/manage requests; prevent exceeding capacity; decision required to progress.
- Applications:
  - Support INDIVIDUAL/GROUP types; eligibility validation; portfolio-driven scoring.
- Chat/Proposals:
  - Threaded messages; proposal object lifecycle; convert to milestone with partner-only action.
- Wallet/Escrow:
  - Balance checks, holds, releases; double-entry ledger.
- Payouts:
  - Split by team ratios; configurable routing to student vs university; receipt/invoice generation.
- Portfolio:
  - Auto-create verified entries on milestone/project completion.
- Permissions:
  - Strict role-based access; supervisors cannot release funds; partners cannot bypass supervisor gate.

### 16. Non-Functional Requirements
- Security: KYC docs encrypted at rest; RBAC; audit logging; invite token hardening.
- Reliability: Idempotent financial operations; retry with safeguards.
- Compliance: Regional KYC/AML, tax info on invoices.
- Performance: Inbox/chat snappy (<200 ms render), scoring jobs async.
- Observability: Metrics for applications, conversion, release times, dispute rates.

### 17. Data Model (concise)
- Organization {id, type: PARTNER|UNIVERSITY, kycStatus, billingProfile}
- KycDocument {orgId, type, url, status}
- Department {id, universityId, name}
- Course {id, departmentId, name, year}
- User {id, role, orgId?, universityId?, profile, payoutMethod?}
- Invitation {id, email, role, org/universityId, token, expiresAt, usedAt}
- SupervisorCapacity {supervisorId, maxActive, currentActive}
- SupervisorRequest {id, projectId, studentOrGroupId, supervisorId, status}
- Group {id, courseId, leaderId, memberIds[]}
- Project {id, partnerId, universityId, departmentId, courseId, supervisorId?}
- Application {id, projectId, applicantType: INDIVIDUAL|GROUP, studentIds[], statement, status}
- Score {applicationId, autoScore, manualSupervisorScore, manualPartnerScore, finalScore}
- ChatThread {id, projectId, type: PROJECT|DM, participantIds[]}
- ChatMessage {id, threadId, senderId, type: TEXT|PROPOSAL|SYSTEM, body}
- MilestoneProposal {id, projectId, proposerId, title, scope, criteria, dueDate, amount?, status}
- Milestone {id, projectId, title, scope, criteria, dueDate, amount, escrowStatus, supervisorGate}
- WalletAccount {orgId, balance}
- WalletTransaction {id, orgId, type, amount, refId}
- Escrow {id, milestoneId, amountHeld, fundedAt, releasedAt, status}
- Submission {id, milestoneId, byGroupId, files[], notes, submittedAt}
- Payout {id, milestoneId, toType: STUDENT|UNIVERSITY, toId, amount, status, txId}
- Invoice {id, contractId?, partnerId, lineItems[], total, status}
- PortfolioItem {id, userId, projectId, role, proof[], rating, verifiedAt}
- Dispute {id, subjectType: milestone, reason, evidence[], state}

### 18. Core Flows (E2E)
1) Super Admin approves partner/university (KYC).
2) University Admin adds supervisors/students (manual/bulk); students get invitation links.
3) Partner creates project → University assigns department/course → students select supervisor → supervisor approves.
4) Students form groups → apply as group/individual.
5) Screening/shortlisting → offers → accept → assignment lock.
6) Chat negotiation → partner finalizes milestones → funds escrow.
7) Team submits → Supervisor gate → Partner approval → release escrow → payout.
8) Portfolio update + reputation → analytics, invoices, audit.

### 19. Acceptance Criteria (samples)
- Students can request a supervisor; supervisor can approve/deny, with capacity enforced.
- Invitations create valid accounts only once; expired tokens rejected.
- Partner cannot move milestone “In Progress” until escrow funded.
- Supervisor “Approve for Partner” required before partner can release funds.
- Payouts split correctly by team ratios or routed to university per policy.
- Portfolio items created automatically on completion with partner rating captured.

### 20. Risks and Mitigations
- Financial errors: use idempotent transactions, ledger reconciliation, clear retry policies.
- Capacity bottlenecks: enforce supervisor caps, waitlists.
- Disputes: clear SLA timers, escalation ladder, auditability.
- Compliance drift: periodic KYC revalidation, document expiry checks.

If you want, I can also provide:
- CSV templates for bulk uploads (headers).
- Sample email templates (invites, supervisor request, approval, payout).
- Wireframe notes for “Supervisor Requests,” “Wallet/Escrow,” and “Milestone Proposal” UI.Here’s the complete end-to-end flow, compact and actor-aware.

1) Super Admin approval (KYC-gated access)
- Partner signs up → uploads legal/KYC → Super Admin approves.
- University signs up → uploads institutional KYC → Super Admin approves.

2) Initial setup
- Partner: completes profile, billing, adds Org Wallet + funding methods (bank/card/mobile money).
- University Admin: manual/bulk upload Departments, Courses, Supervisors, Students.
- Students/Supervisors receive invitation links → set password → complete profiles.

3) Project creation and publication
- Partner creates project (scope, skills, timeline, budget).
- University Admin reviews → assigns Department/Course.
- Students select a Supervisor → Supervisor approves/denies (capacity enforced).
- Project published for applications under the assigned course.

4) Group formation and applications
- Students form groups (leader invites/approves; can apply solo if needed).
- Apply to project as Group or Individual.
- System eligibility gate (course, year, skills, deadlines, capacity).

5) Screening and shortlisting (portfolio-first)
- Auto-scoring (verified portfolio items, partner ratings, on-time rate, rework rate, skill match).
- Manual scoring (Supervisor + optional Partner recommendation).
- Buckets: Rejected, Consider, Shortlist, Waitlist.

6) Offers and assignment
- University Admin/Supervisor issues offers to top Group/Individual.
- Acceptance locks team and capacity; waitlist auto-promotes on expiry/decline.
- Assigned team gains full project workspace + messaging.

7) Milestone negotiation (in chat)
- Project chat: Partner ↔ Group (Supervisor can comment).
- Either side proposes milestones (title, scope, acceptance criteria, due date, amount).
- Students accept proposal; Partner finalizes → Milestone created (org-owned).

8) Funding and escrow
- Partner funds each finalized milestone from Org Wallet → Escrow (hold).
- Unfunded milestones cannot move to “In Progress.”

9) Execution and tracking (supervisor-gated)
- Team works; submits deliverables + notes for the milestone.
- Supervisor Review (mandatory):
  - Approve for Partner / Request Changes / Add notes & risks / Adjust progress readiness.
- Partner Review:
  - Approve → Release escrow → Payout OR Request Changes → back to team via chat.

10) Payouts, invoices, ledgers
- On approval: Escrow → Payouts
  - Route to students (split by team ratio) OR to university account (policy toggle).
- System generates invoice/receipt; updates wallet, escrow, payout ledgers.

11) Completion, portfolio, reputation
- On milestone/project completion:
  - Auto-create verified portfolio entries (role, proof links, partner rating, complexity).
  - Update reputation (completed projects, avg ratings, on-time rate, disputes/rework).
- Portfolio/reputation feed future screenings (no grades used).

12) Reporting, compliance, disputes
- Partner: wallet balance, escrow holds, spend, payments, invoices, milestone status.
- University: onboarding (manual/bulk), supervisor capacity, routing policy, dispute center.
- Students: earnings, pending releases, payout history, portfolio.
- Disputes: Student/Partner → Supervisor → University Admin → Super Admin (final). Full audit trail.

States and gates (key checkpoints)
- Org access: KYC PENDING → APPROVED (Super Admin).
- Supervisor selection: REQUESTED → APPROVED/DENIED (capacity-aware).
- Application: SUBMITTED → SHORTLISTED/WAITLIST/REJECTED → OFFERED → ACCEPTED → ASSIGNED.
- Milestone: PROPOSED → ACCEPTED (students) → FINALIZED (partner) → FUNDED → IN PROGRESS → SUBMITTED → SUPERVISOR APPROVED → PARTNER APPROVED → RELEASED → COMPLETED.

Financial safeguards
- KYC approval required before funding, escrow, or payouts.
- Wallet top-up prompts; idempotent ledger with deposits/holds/releases/fees.
- Escrow enforced per milestone; partner cannot approve without supervisor gate.

Outcome
- A compliant, milestone-driven, portfolio-first system where:
  - Students choose supervisors (with supervisor approval).
  - Projects are negotiated via chat, funded in escrow, and released on approvals.
  - All actors have clear visibility, auditability, and curated reputation feedback loops. gen for me the full app client side dummy data, no securing of the screens, 