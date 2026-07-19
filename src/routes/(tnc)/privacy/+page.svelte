<script>
	import { Particles } from '$lib/components/custom';
	import Email from '@lucide/svelte/icons/mail';
	import Website from '@lucide/svelte/icons/globe';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Privacy Policy | MicroManus</title>
</svelte:head>

<Particles class="fixed top-0 -z-10 h-screen w-screen" />

<main class="z-50 mx-auto max-w-3xl p-6">
	<h1>Privacy Policy</h1>

	<p class="last-updated">
		<strong>Last updated:</strong> July 19, 2026
	</p>

	<p>
		At <strong>MicroManus</strong> (<a href={resolve('/')}>https://micromanus.tsuzat.com</a>), we
		are committed to protecting your privacy. This Privacy Policy explains what personal information
		we collect, how we use it, how we store it, and your rights in relation to that information. By
		using our Service, you consent to the practices described in this Policy.
	</p>

	<p>
		If you have any questions, contact us at
		<a href="mailto:contact@tsuzat.com">contact@tsuzat.com</a>.
	</p>

	<h2>1. Who We Are</h2>
	<p>
		MicroManus is a collaborative kanban application that enables users to create and manage task
		boards with other users. It is operated from <strong>India</strong> and primarily serves a
		global audience aged <strong>13 and above</strong>.
	</p>

	<h2>2. Information We Collect</h2>
	<p>We collect the following categories of personal and non-personal information:</p>

	<h3>a. Account and Authentication Data</h3>
	<ul>
		<li>Email address (required for login)</li>
		<li>OAuth profile data (e.g. Google name, avatar if applicable)</li>
		<li>User ID and session tokens</li>
	</ul>

	<h3>b. User-Generated Content</h3>
	<ul>
		<li>Cards, Sections, Board, Comments (Pro users only), Tasks (Pro users only)</li>
		<li>Profile picture (Pro users only)</li>
	</ul>

	<h3>c. Usage and Analytics Data</h3>
	<ul>
		<li>Pages visited, features used, session duration</li>
		<li>Click behavior and interaction logs</li>
		<li>Referral sources and device/browser information</li>
	</ul>

	<h3>d. Location Data</h3>
	<ul>
		<li>IP-based approximate geographic location</li>
	</ul>

	<h2>3. How We Use Your Information</h2>
	<p>We use your information for the following purposes:</p>
	<ul>
		<li>To provide, maintain and improve the Service</li>
		<li>To authenticate and manage your account</li>
		<li>To support collaboration features (sharing boards, commenting)</li>
		<li>To analyze usage trends and improve user experience</li>
		<li>To communicate with you (e.g. updates, billing, support)</li>
		<li>To manage paid subscriptions and payments</li>
		<li>To enforce our Terms of Service and prevent abuse</li>
	</ul>

	<h2>4. Legal Basis for Processing (Under Indian Law)</h2>
	<p>Your data is processed based on:</p>
	<ul>
		<li><strong>Consent</strong>: Given when you sign up or use our features</li>
		<li><strong>Contractual necessity</strong>: Required to provide you with services</li>
		<li>
			<strong>Legal obligation</strong>: For compliance with applicable laws (e.g. IT Act, and
			evolving data protection laws)
		</li>
		<li>
			<strong>Legitimate interest</strong>: For security, analytics, and service optimization
		</li>
	</ul>

	<h2>5. Third-Party Services</h2>
	<p>We share data with trusted third parties to support our operations:</p>

	<h3>a. Payments</h3>
	<ul>
		<li>Managed by <strong>Polar.sh</strong>, which uses <strong>Stripe</strong></li>
		<li>
			Billing info, subscription history, and customer portal data is handled directly by these
			platforms
		</li>
	</ul>

	<h3>b. Analytics</h3>
	<ul>
		<li>
			We use tools (e.g., Google Analytics or similar) to collect anonymized usage data via cookies
		</li>
	</ul>

	<h3>c. Community Support</h3>
	<ul>
		<li>
			Pro users may be invited to a <strong>Discord channel</strong>. Participation is optional.
		</li>
	</ul>

	<p>These services have their own privacy policies and handle your data independently.</p>

	<h2>6. Cookies and Tracking</h2>
	<p>We use cookies and local storage to:</p>
	<ul>
		<li>Maintain your session</li>
		<li>Remember preferences</li>
		<li>Measure feature performance</li>
	</ul>
	<p>You can control cookie settings in your browser. Disabling cookies may limit functionality.</p>

	<h2>7. How We Store and Protect Your Information</h2>
	<p>We take reasonable security measures to protect your personal data:</p>
	<ul>
		<li>Access control and encryption for sensitive data</li>
		<li>Hosting on secure, industry-standard infrastructure</li>
		<li>Limited employee access to user data</li>
		<li>Regular security reviews</li>
	</ul>
	<p>Despite our efforts, no method of data transmission over the internet is 100% secure.</p>

	<h2>8. Data Retention</h2>
	<p>We retain your data:</p>
	<ul>
		<li>As long as your account is active</li>
		<li>As needed to comply with legal obligations or resolve disputes</li>
		<li>Deleted upon request or account closure (subject to backups and audit logs)</li>
	</ul>

	<h2>9. Your Rights</h2>
	<p>As a user, especially under Indian privacy norms, you have the right to:</p>
	<ul>
		<li><strong>Access</strong> the personal data we hold about you</li>
		<li><strong>Correct</strong> inaccurate or outdated data</li>
		<li><strong>Delete</strong> your account and associated content</li>
		<li><strong>Withdraw consent</strong> for non-essential processing</li>
		<li>
			<strong>File a complaint</strong> with the appropriate data protection authority if available
		</li>
	</ul>
	<p>
		To exercise these rights, contact us at
		<a href="mailto:contact@tsuzat.com">contact@tsuzat.com</a>.
	</p>

	<h2>10. Children’s Privacy</h2>
	<p>
		MicroManus is intended for users aged <strong>13 and above</strong>. We do not knowingly collect
		data from children under 13. If you believe a child has used the service without appropriate
		consent, contact us for immediate deletion of the account.
	</p>

	<h2>11. Changes to This Policy</h2>
	<p>
		We may update this Privacy Policy to reflect legal, technical, or business changes. When we do,
		we will post the updated date at the top. Continued use of the Service means you accept the
		revised policy.
	</p>
	<p>We recommend reviewing this page periodically.</p>

	<h2>12. Contact Us</h2>
	<p>If you have any questions or concerns about this policy or your data, please contact:</p>
	<ul>
		<li class="flex list-none items-center gap-4">
			<Email class="size-4" />
			<a class="nodefault" href="mailto:contact@tsuzat.com"
				><strong>contact@tsuzat.com</strong></a
			>
		</li>
		<li class="flex list-none items-center gap-4">
			<Website class="size-4" />
			<a class="nodefault" href={resolve('/')}><strong>https://micromanus.tsuzat.com</strong></a>
		</li>
	</ul>
</main>

<style>
	main > * {
		margin: 1rem 0;
	}

	p {
		color: var(--color-muted-foreground);
	}

	li {
		color: var(--color-muted-foreground);
		margin: 0.5rem;
	}
	li {
		margin-left: 1.5rem;
		list-style: disc !important;
	}

	li > strong:first-child {
		text-decoration: underline;
	}

	strong {
		color: var(--color-foreground);
		font-weight: 500;
	}

	a {
		color: var(--color-primary);
		text-decoration: underline;
	}
</style>
