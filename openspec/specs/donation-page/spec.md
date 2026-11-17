# donation-page Specification

## Purpose

Defines requirements for the public donation page at `/donate`, payment methods (Agribank QR and PayPal), localized copy, responsive layout, and entry points across the app layout, home page, and sidebar navigation.

## Requirements

### Requirement: Public Donation Page Route
The site SHALL provide a public donation page accessible at `/donate` within the standard app layout.

#### Scenario: Navigating to the donation page
- **WHEN** a visitor navigates to `/donate`
- **THEN** the donation page renders within the standard app layout with explanatory copy and payment options

---

### Requirement: Supported Donation Methods
The donation page SHALL display distinct cards for supported payment methods including Agribank, PayPal, and Buy Me a Coffee.

#### Scenario: Agribank payment display
- **WHEN** the donation page renders
- **THEN** an Agribank payment card is displayed featuring the QR image and identifying labels

#### Scenario: PayPal payment display
- **WHEN** the donation page renders
- **THEN** a PayPal payment card is displayed with appropriate account information and branding

#### Scenario: Buy Me a Coffee payment display
- **WHEN** the donation page renders
- **THEN** a Buy Me a Coffee payment card is displayed with creator profile information, scannable QR code, and a direct button linking to https://buymeacoffee.com/nguyennhonh

---

### Requirement: Layout Entry Points and Route Integration
The application SHALL provide clear navigation links to `/donate` from the home page hero, footer, and sidebar.

#### Scenario: Home page donate CTA
- **WHEN** a visitor views the home page hero section or footer
- **THEN** a Donate call-to-action button/link is displayed that navigates to `/donate`

#### Scenario: Sidebar navigation link
- **WHEN** a visitor views the app sidebar navbar
- **THEN** a Donate link is rendered in the bottom navigation group above Help and Change Language

#### Scenario: Responsive presentation
- **WHEN** viewed on mobile or narrow viewports
- **THEN** payment method cards stack vertically without horizontal overflow, while arranging side by side on desktop screens