#!/usr/bin/env python3
"""
Seed all 11 enterprise documents and Bedrock .metadata.json sidecars
for Nexora Technologies across HR, Engineering, Finance, IT, Operations, Management.
"""

import json
from pathlib import Path

DOCS = [
    {
        "rel_path": "hr/policies/NEX-HR-POL-001-RemoteWork-2026.txt",
        "meta": {
            "department": "Human Resources",
            "classification": "PUBLIC_INTERNAL",
            "documentId": "NEX-HR-POL-001",
            "title": "Nexora Global Remote Work & Hybrid Schedule Policy 2026",
            "uploadedBy": "marcus.chen@nexora.com",
            "version": "3.2",
            "lastUpdated": "2026-09-15",
            "author": "Marcus Chen",
            "category": "Policy"
        },
        "content": """NEXORA TECHNOLOGIES PVT LTD
HUMAN RESOURCES POLICY DOCUMENT: GLOBAL REMOTE WORK & HYBRID SCHEDULE
Document ID: NEX-HR-POL-001 (Rev 3.2, 2026)
Classification: PUBLIC_INTERNAL

1. PURPOSE & SCOPE
This policy establishes guidelines for flexible and remote working arrangements for all full-time employees in good standing.

2. CORE HYBRID SCHEDULE
- Employees classified as "Hybrid" are expected in their designated regional office 2 days per week (typically Tuesdays and Thursdays).
- Fully remote arrangements require written approval from Department VP and HR People Partner.

3. CORE WORKING HOURS
- All team members must be reachable on Slack between 09:30 AM and 06:30 PM Indian Standard Time (IST) for synchronous collaboration.

4. HOME OFFICE & BROADBAND STIPEND
- ₹50,000 one-time setup reimbursement for ergonomic workstation equipment upon joining.
- ₹2,000/month recurring internet subsidy credited via monthly payroll.
- ₹25,000 annual equipment refresh allowance through SAP Concur under "Remote Office Refresh"."""
    },
    {
        "rel_path": "hr/benefits/NEX-HR-BEN-002-Benefits-Guide-2026.txt",
        "meta": {
            "department": "Human Resources",
            "classification": "DEPARTMENT_ONLY",
            "documentId": "NEX-HR-BEN-002",
            "title": "Comprehensive Employee Healthcare & Wellness Benefits Guide",
            "uploadedBy": "marcus.chen@nexora.com",
            "version": "2.0",
            "lastUpdated": "2026-09-18",
            "author": "Marcus Chen",
            "category": "Benefits"
        },
        "content": """NEXORA TECHNOLOGIES INDIA PVT LTD - HR BENEFITS DIRECTORY 2026
CLASSIFICATION: DEPARTMENT_ONLY

1. GROUP HEALTH & ACCIDENT INSURANCE (GMC / GPA)
- Plan A: HDFC ERGO / Star Health ₹10,00,000 Family Floater covering employee, spouse, 2 dependent children, and parents.
- Outpatient Dental & Vision: ₹50,000 annual claim limit for dental procedures, scaling, implants, and prescription eyewear.
- Cashless Hospitalization: 10,000+ networked hospitals across India with zero co-pay.

2. RETIREMENT, EPF & GRATUITY
- Employees' Provident Fund (EPF): 12% matching statutory employer contribution under EPFO guidelines.
- Gratuity: Payable per Payment of Gratuity Act 1972 on completion of continuous service.
- Voluntary Provident Fund (VPF) & NPS Tier-1 corporate tax-saving contribution support under Section 80CCD(2).

3. MENTAL WELLNESS & EAP
- 12 free 1-on-1 counseling and mental wellness sessions per year via 1to1help for employees and immediate family members."""
    },
    {
        "rel_path": "hr/policies/NEX-HR-LV-003-Leave-Policy.txt",
        "meta": {
            "department": "Human Resources",
            "classification": "PUBLIC_INTERNAL",
            "documentId": "NEX-HR-LV-003",
            "title": "Annual Leave, Parental & Sabbatical Policy",
            "uploadedBy": "marcus.chen@nexora.com",
            "version": "1.8",
            "lastUpdated": "2026-08-10",
            "author": "Marcus Chen",
            "category": "Policy"
        },
        "content": """NEXORA LEAVE POLICY & TIME-OFF GUIDELINES
1. ANNUAL PAID TIME OFF (PTO)
- Full-time staff receive 22 accruable vacation days per calendar year, with up to 5 days rolling over into Q1.

2. PARENTAL LEAVE
- 16 weeks of 100% paid leave for both primary and secondary caregivers following birth, adoption, or foster placement.

3. SICK LEAVE & BEREAVEMENT
- 10 dedicated paid sick days per year.
- 5 consecutive business days of fully paid bereavement leave."""
    },
    {
        "rel_path": "engineering/runbooks/NEX-ENG-ARC-001-Deployment-Runbook.txt",
        "meta": {
            "department": "Engineering",
            "classification": "DEPARTMENT_ONLY",
            "documentId": "NEX-ENG-ARC-001",
            "title": "Nexora Cloud Production Deployment & Zero-Downtime Pipeline Runbook",
            "uploadedBy": "gautham@nexora.com",
            "version": "4.5",
            "lastUpdated": "2026-09-29",
            "author": "Gautham",
            "category": "Runbook"
        },
        "content": """NEXORA ENGINEERING SOP: PRODUCTION RELEASES (RUNBOOK-001)
SECURITY CLASSIFICATION: ENGINEERING DEPARTMENT ONLY

1. PRE-DEPLOYMENT GATES
- All pull requests require 0 Critical/High SonarQube issues and >=85% unit test coverage.
- Two Senior Staff Engineer approvals required on main branch pull requests.

2. CANARY DEPLOYMENT STRATEGY ON KUBERNETES (AMAZON EKS)
- ArgoCD triggers Canary deployment on cluster 'nexora-prod-cluster-us-east-1'.
- Phase 1: 10% traffic routing to Canary pods for 15 minutes.
- Automated Rollback: CloudWatch Metric Filter monitors HTTP 5xx error rate. If error rate > 0.1%, automated rollback initiates within 60 seconds.
- Phase 2: 50% traffic for 30 minutes, followed by 100% promotion.

3. SERVERLESS LAMBDA DEPLOYMENTS
- Serverless microservices deploy using AWS SAM / CodeDeploy with Linear10PercentEvery1Minute traffic shifting strategy."""
    },
    {
        "rel_path": "engineering/security/NEX-ENG-SEC-002-API-Security.txt",
        "meta": {
            "department": "Engineering",
            "classification": "DEPARTMENT_ONLY",
            "documentId": "NEX-ENG-SEC-002",
            "title": "Engineering API Security Standards & Microservices Hardening Guide",
            "uploadedBy": "gautham@nexora.com",
            "version": "2.1",
            "lastUpdated": "2026-09-02",
            "author": "Gautham",
            "category": "Security Standard"
        },
        "content": """NEXORA TECH - API SECURITY ARCHITECTURE SPECIFICATION
1. AUTHENTICATION & TOKEN HANDLING
- All incoming REST endpoints exposed through Amazon API Gateway must validate asymmetric RSA-256 signatures against Cognito JWKS URI.
- Token expiration (TTL) must not exceed 60 minutes for Access Tokens.

2. SECRETS MANAGEMENT
- Hardcoded API credentials in source repositories are strictly forbidden.
- All database passwords and third-party tokens must be stored in AWS Secrets Manager with 30-day automatic rotation Lambda functions."""
    },
    {
        "rel_path": "finance/policies/NEX-FIN-EXP-001-Expense-Reimbursement.txt",
        "meta": {
            "department": "Finance",
            "classification": "PUBLIC_INTERNAL",
            "documentId": "NEX-FIN-EXP-001",
            "title": "Global Travel & Expense Reimbursement SOP",
            "uploadedBy": "sophia.rodriguez@nexora.com",
            "version": "2.4",
            "lastUpdated": "2026-08-20",
            "author": "Sophia Rodriguez",
            "category": "Standard Operating Procedure"
        },
        "content": """NEXORA TECHNOLOGIES INDIA PVT LTD - FINANCE SOP (NEX-FIN-EXP-001)
EXPENSE REIMBURSEMENTS & TRAVEL POLICY

1. SUBMISSION TIMELINE
- Employees must submit GST-compliant itemized expense invoices via SAP Concur within thirty (30) calendar days of transaction date.

2. MEAL PER DIEM ALLOWANCES
- Domestic Business Travel (Tier-1 Indian Metros): ₹2,500.00 daily allowance (Breakfast: ₹500, Lunch: ₹800, Dinner: ₹1,200).
- International Travel: Converted at SBI TT card rate with prior Director approval.

3. HOTEL & LODGING LIMITS
- Tier-1 Metros (Bengaluru, Mumbai, NCR Delhi/Gurugram, Hyderabad): ₹7,500.00 to ₹12,000.00/night excluding GST.
- Tier-2 Cities (Pune, Chennai, Ahmedabad, Kolkata): ₹5,000.00 to ₹7,500.00/night.

4. APPROVAL CHAIN
- Expenses < ₹50,000: Direct Line Manager approval.
- Expenses >= ₹50,000: Line Manager + Department VP approval.
- Disbursements occur via NEFT / RTGS on the 15th and last business day of every month."""
    },
    {
        "rel_path": "finance/confidential/NEX-FIN-PAY-002-Executive-Bonus-Matrix-Confidential.txt",
        "meta": {
            "department": "Finance",
            "classification": "RESTRICTED",
            "documentId": "NEX-FIN-PAY-002",
            "title": "Executive Compensation & Q3 Performance Bonus Allocation Matrix",
            "uploadedBy": "sophia.rodriguez@nexora.com",
            "version": "1.0",
            "lastUpdated": "2026-09-30",
            "author": "Sophia Rodriguez",
            "category": "Payroll Matrix"
        },
        "content": """RESTRICTED & HIGHLY CONFIDENTIAL - FINANCE & EXECUTIVE BOARD ONLY
DOCUMENT ID: NEX-FIN-PAY-002

1. TARGET BONUS MULTIPLIERS
- Executive Level E-1 (VP & SVP): 35% to 50% target bonus based on EBITDA targets and annual recurring revenue (ARR) milestones.
- Director Level D-1: 20% to 30% bonus tier.

2. EQUITY VESTING REFRESH CRITERIA
- Annual RSUs refreshed on October 1st following performance committee evaluation."""
    },
    {
        "rel_path": "itsupport/guides/NEX-IT-VPN-001-Troubleshooting-Guide.txt",
        "meta": {
            "department": "IT Support",
            "classification": "PUBLIC_INTERNAL",
            "documentId": "NEX-IT-VPN-001",
            "title": "Enterprise GlobalProtect VPN & Hardware MFA Troubleshooting Guide",
            "uploadedBy": "david.kim@nexora.com",
            "version": "3.1",
            "lastUpdated": "2026-09-10",
            "author": "David Kim",
            "category": "Troubleshooting Runbook"
        },
        "content": """NEXORA IT HELPDESK RUNBOOK: REMOTE CONNECTIVITY & VPN
DOCUMENT ID: NEX-IT-VPN-001

1. GLOBALPROTECT GATEWAYS
- Primary US Gateway: 'vpn-east.nexora.internal' (Port 443)
- European Gateway: 'vpn-eu.nexora.internal'
- Asia-Pacific Gateway: 'vpn-apac.nexora.internal'

2. RESOLVING COMMON ERROR CODES
- Error 504 / Connection Timeout:
  Step 1: Restart Palo Alto Networks GlobalProtect service in Windows Services or Mac launchctl.
  Step 2: Flush local DNS cache ('ipconfig /flushdns' or 'sudo dscacheutil -flushcache').
  Step 3: Ensure corporate Zscaler client is running version 4.2 or higher.

3. HARDWARE MFA / YUBIKEY RESETS
- Insert YubiKey 5C NFC into USB port and tap the gold capacitive sensor for 3 seconds.
- Urgent helpdesk Slack channel: #it-urgent-helpdesk."""
    },
    {
        "rel_path": "itsupport/security/NEX-IT-SEC-002-Password-Security.txt",
        "meta": {
            "department": "IT Support",
            "classification": "PUBLIC_INTERNAL",
            "documentId": "NEX-IT-SEC-002",
            "title": "Zero-Trust Endpoint Security & 90-Day Password Rotation Standard",
            "uploadedBy": "david.kim@nexora.com",
            "version": "2.0",
            "lastUpdated": "2026-08-15",
            "author": "David Kim",
            "category": "Security Policy"
        },
        "content": """NEXORA IT SECURITY POLICY - CREDENTIAL & IDENTITY INTEGRITY
1. PASSWORD COMPLEXITY CRITERIA
- Minimum 16 characters incorporating uppercase, lowercase, number, and two special characters.
- Dictionary words and repetitive sequences are rejected automatically by Okta/Cognito.

2. ROTATION INTERVALS
- Master Okta and AWS SSO credentials must be rotated every 90 days.
- Automated account lockout occurs within 5 minutes if leaked credentials appear on AWS GuardDuty dark-web feeds."""
    },
    {
        "rel_path": "operations/dr/NEX-OPS-DR-001-Disaster-Recovery.txt",
        "meta": {
            "department": "Operations",
            "classification": "CONFIDENTIAL",
            "documentId": "NEX-OPS-DR-001",
            "title": "Business Continuity & Multi-Region Disaster Recovery Protocol",
            "uploadedBy": "amara.patel@nexora.com",
            "version": "4.0",
            "lastUpdated": "2026-07-22",
            "author": "Amara Patel",
            "category": "Disaster Recovery"
        },
        "content": """NEXORA OPERATIONS - GLOBAL DISASTER RECOVERY PROTOCOL
CLASSIFICATION: CONFIDENTIAL

1. OBJECTIVES (RTO & RPO)
- RTO (Recovery Time Objective): Maximum 15 minutes for Tier-1 Customer Portal and Payment APIs.
- RPO (Recovery Point Objective): Maximum 5 minutes data loss limit via DynamoDB Global Tables and Aurora Multi-Region.

2. FAILOVER COMMAND STRUCTURE
- Disaster declaration authority: VP of Operations or Head of Cloud Infrastructure.
- Automated Route 53 Application Recovery Controller (ARC) health checks trigger DNS failover if primary region error rate > 5% for 3 consecutive minutes."""
    },
    {
        "rel_path": "management/strategy/NEX-MGMT-STRAT-001-Strategic-Roadmap.txt",
        "meta": {
            "department": "Management",
            "classification": "RESTRICTED",
            "documentId": "NEX-MGMT-STRAT-001",
            "title": "Nexora 2026-2028 Strategic Roadmap & M&A Expansion Plan",
            "uploadedBy": "vikram.malhotra@nexora.com",
            "version": "1.0",
            "lastUpdated": "2026-09-12",
            "author": "Vikram Malhotra",
            "category": "Corporate Strategy"
        },
        "content": """RESTRICTED & HIGHLY CONFIDENTIAL - MANAGEMENT ONLY
DOCUMENT ID: NEX-MGMT-STRAT-001

1. MARKET EXPANSION & GEOGRAPHIC STRATEGY
- EMEA Hub Launch in London Q2 2027.
- Commercialization of Nexora's internal GenAI knowledge platform on AWS Marketplace.

2. M&A TARGETS
- Target Alpha (₹100 Cr - ₹150 Cr): Compliance scanning for AWS GovCloud & Indian Data Protection DPDP compliance.
- Target Beta (₹65 Cr - ₹85 Cr): Real-time vector observability and hallucination detection."""
    }
]

def main():
    base_dir = Path(__file__).resolve().parents[1] / "documents"
    base_dir.mkdir(parents=True, exist_ok=True)
    
    count = 0
    for doc in DOCS:
        doc_file = base_dir / doc["rel_path"]
        meta_file = base_dir / f"{doc['rel_path']}.metadata.json"
        
        doc_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(doc_file, 'w', encoding='utf-8') as f:
            f.write(doc["content"])
            
        with open(meta_file, 'w', encoding='utf-8') as f:
            json.dump({"metadataAttributes": doc["meta"]}, f, indent=2)
            
        count += 1
        print(f"Generated: {doc['rel_path']} + metadata sidecar")
        
    print(f"\nSuccessfully created {count} documents and {count} sidecar metadata files.")

if __name__ == "__main__":
    main()
