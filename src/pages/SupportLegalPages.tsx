import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  );
}

export function HelpCenterPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Help Center"
        description="Find step-by-step guidance, best practices, and operational support for using MedExchangePro."
      />

      <Section title="Overview">
        <p>
          The Help Center provides clinical and administrative users with clear workflows for referrals,
          patient coordination, transfer management, and reporting.
        </p>
      </Section>

      <Section title="Key resources">
        <ul className="mt-4 space-y-3 list-disc pl-5">
          <li>
            <strong>Referral workflows:</strong> How to create, review, approve, and close referrals safely.
          </li>
          <li>
            <strong>Patient records:</strong> How to search records, view transfer history, and verify demographics.
          </li>
          <li>
            <strong>Hospital coordination:</strong> How to identify receiving departments and manage cross-facility communication.
          </li>
          <li>
            <strong>Issue troubleshooting:</strong> Browser access, session timeouts, and data validation guidance.
          </li>
        </ul>
      </Section>

      <Section title="How to use support effectively">
        <p>
          Use this page as your first stop when you need help tracking workflow steps, completing a referral, or
          resolving common account issues. If you need personalized assistance, visit the Contact Us page.
        </p>
      </Section>
    </div>
  );
}

export function ContactUsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Contact Us"
        description="Send a support request to the MedExchangePro team for clinical, technical, or account assistance."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Section title="Support request form">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  <span>Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@hospital.org"
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-700">
                <span>Hospital or department</span>
                <input
                  type="text"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="Cardiology, Emergency, Radiology..."
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-700">
                <span>Subject</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Referral approval delay"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-700">
                <span>Message</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Describe the issue or request in detail"
                  rows={6}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Submit request
              </button>
            </form>
            {submitted && (
              <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Thank you for your request. Our support desk will contact you shortly with next steps.
              </p>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Contact details">
            <p className="text-sm text-slate-600">
              For urgent coordination issues, use the hospital support desk information below. For general product questions,
              submit the support request form.
            </p>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">Email</p>
                <p>support@medexchangepro.com</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Phone</p>
                <p>+250 (783) 555 0123</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Office hours</p>
                <p>Mon–Fri, 08:00–18:00</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Support scope</p>
                <p>
                  Referral workflow issues, system access questions, patient record discrepancies, and urgent data integration support.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Helpful links">
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link to="/help-center" className="font-medium text-indigo-600 hover:text-indigo-700">
                  Visit the Help Center for workflows and troubleshooting
                </Link>
              </li>
              <li>
                <Link to="/faq" className="font-medium text-indigo-600 hover:text-indigo-700">
                  Browse frequently asked questions
                </Link>
              </li>
              <li>
                <Link to="/documentation" className="font-medium text-indigo-600 hover:text-indigo-700">
                  Review the documentation hub
                </Link>
              </li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

export function DocumentationPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Documentation"
        description="Access MedExchangePro documentation, integration instructions, and workflow definitions for clinicians and administrators."
      />

      <Section title="What is covered here?">
        <ul className="mt-4 space-y-3 list-disc pl-5">
          <li>
            <strong>System workflows:</strong> referral creation, patient search, transfer management, and reporting.
          </li>
          <li>
            <strong>Integration guides:</strong> how hospital systems connect, exchange patient data, and maintain secure sessions.
          </li>
          <li>
            <strong>Role-based access:</strong> the responsibilities of clinicians, care coordinators, and administrators.
          </li>
          <li>
            <strong>Data policies:</strong> how privacy, security, and audit logging are enforced.
          </li>
        </ul>
      </Section>

      <Section title="Primary topics">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold text-slate-900">Referral Management</p>
            <p className="mt-2 text-sm text-slate-600">How to submit, approve, update, and monitor referral progress.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold text-slate-900">Patient Coordination</p>
            <p className="mt-2 text-sm text-slate-600">How to review patient details, clinical history, and transfer readiness.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold text-slate-900">Reporting</p>
            <p className="mt-2 text-sm text-slate-600">How to run operational reports, identify bottlenecks, and export referral data.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold text-slate-900">Security & Compliance</p>
            <p className="mt-2 text-sm text-slate-600">How MedExchangePro protects patient data and meets healthcare compliance requirements.</p>
          </div>
        </div>
      </Section>
    </div>
  );
}

export function FAQPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="FAQ"
        description="Frequently asked questions for clinicians, care coordinators, and administrators using MedExchangePro."
      />

      <Section title="Common questions">
        <div className="space-y-6">
          <div>
            <p className="font-semibold text-slate-900">How do I submit a new referral?</p>
            <p className="mt-2 text-sm text-slate-600">
              Go to the Referrals page and choose "New referral". Complete the patient details, requesting and receiving hospital, and clinical notes.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">How can I track referral status?</p>
            <p className="mt-2 text-sm text-slate-600">
              Open the referral details page and review the status badge. You can view pending, approved, and completed referrals there.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Who can access patient records?</p>
            <p className="mt-2 text-sm text-slate-600">
              Access is role-based. Only authorized clinicians and administrators in your organization may view patient and referral data.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">What should I do if I cannot log in?</p>
            <p className="mt-2 text-sm text-slate-600">
              Use Forgot Password from the sign-in page. If the problem persists, contact support for account recovery.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Privacy Policy"
        description="Understand how MedExchangePro collects, uses, and protects patient and user information in accordance with healthcare privacy principles."
      />

      <Section title="What data we collect">
        <p>
          We collect personal and clinical data required for referral coordination and patient care, including patient demographics, contact details,
          referral metadata, and care team assignments.
        </p>
      </Section>

      <Section title="How we use data">
        <ul className="mt-4 space-y-3 list-disc pl-5">
          <li>To enable referral processing and hospital coordination.</li>
          <li>To support clinical decision making and transfer logistics.</li>
          <li>To provide audit trails and secure system access for authorized users.</li>
        </ul>
      </Section>

      <Section title="How we protect privacy">
        <p>
          Patient and user data is protected through role-based access, encrypted communication, and audit logging. We only share information
          when required for care coordination or permitted by applicable regulations.
        </p>
      </Section>
    </div>
  );
}

export function TermsOfServicePage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Terms of Service"
        description="Review the terms and conditions for using MedExchangePro, including acceptable use, responsibilities, and user commitments."
      />

      <Section title="General use">
        <p>
          MedExchangePro is provided to authorized healthcare organizations and users for secure referral and patient coordination. Users may only
          access the system for legitimate clinical and administrative purposes.
        </p>
      </Section>

      <Section title="User responsibilities">
        <ul className="mt-4 space-y-3 list-disc pl-5">
          <li>Maintain the confidentiality of login credentials.</li>
          <li>Use patient data only for authorized care coordination and referral activities.</li>
          <li>Report suspicious activity or unauthorized access promptly.</li>
        </ul>
      </Section>

      <Section title="Limitations and legal notices">
        <p>
          The service is provided as-is with reasonable security and availability commitments. Liability is limited to the extent permitted by applicable law.
        </p>
      </Section>
    </div>
  );
}

export function SecurityPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Security"
        description="Learn how MedExchangePro secures healthcare data through authentication, authorization, encryption, and audit controls."
      />

      <Section title="Authentication & access control">
        <p>
          User access is managed through secure authentication with role-based permissions. Only authorized users can view or modify patient referrals and records.
        </p>
      </Section>

      <Section title="Data protection">
        <ul className="mt-4 space-y-3 list-disc pl-5">
          <li>All data is encrypted in transit using TLS.</li>
          <li>Stored data is protected by secure database access controls.</li>
          <li>Audit logs record access and changes for compliance monitoring.</li>
        </ul>
      </Section>

      <Section title="Incident reporting">
        <p>
          If you suspect a security incident, contact support immediately and follow your organization’s incident response policies.
        </p>
      </Section>
    </div>
  );
}

export function CompliancePage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Compliance"
        description="Read about how MedExchangePro aligns with healthcare data protection and clinical coordination compliance standards."
      />

      <Section title="Regulatory alignment">
        <p>
          MedExchangePro is designed to support healthcare privacy and security expectations. This includes data handling practices, audit
          logging, and role-based access controls.
        </p>
      </Section>

      <Section title="Audit readiness">
        <ul className="mt-4 space-y-3 list-disc pl-5">
          <li>Audit logs capture referral and patient record access events.</li>
          <li>All user actions are traceable for accountability.</li>
          <li>System workflows are documented to support clinical governance.</li>
        </ul>
      </Section>

      <Section title="User obligations">
        <p>
          Users must follow their hospital’s privacy policies, protect patient confidentiality, and only use the system for authorized care coordination.
        </p>
      </Section>
    </div>
  );
}
